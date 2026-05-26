from google import genai
from pydantic import BaseModel
from typing import List
import json

from services.gemini.key_manager import key_manager

class AIChatResponse(BaseModel):
    reasoning: str
    steps: List[str]
    actions: List[str]
    elastic_query: str

class AIInsightResponse(BaseModel):
    insights: str
    actions: List[str]

def generate_player_insights(user_query: str, players: List[dict], module: str = "scout") -> dict:
    if not players:
        return "No players found matching your criteria."

    # Limit to top 5 for the prompt to avoid token bloat
    top_players = players[:5]
    player_summaries = []
    for p in top_players:
        summary = f"- {p.get('name')} ({p.get('team')}, Age {p.get('age')}): Role {p.get('role')}, Avg {p.get('avg')}, SR {p.get('sr')}, Risk {p.get('injuryRisk')}%, Rating {p.get('rating')}"
        player_summaries.append(summary)
    
    players_text = "\n".join(player_summaries)

    module_instructions = ""
    if module == "injury":
        module_instructions = "Since the user is in the **InjuryIQ Dashboard**, strictly focus your insights on player workload, injury risks, medical clearance, and suggest safe replacements."
    elif module == "form":
        module_instructions = "Since the user is in the **FormCast Dashboard**, strictly focus your insights on peak performance windows, recent form vs career average, and striking momentum."
    elif module == "tactics":
        module_instructions = "Since the user is in the **OpponentEdge Tactics Dashboard**, strictly focus on macro-level team matchups, role distributions, and opponent vulnerabilities."
    else:
        module_instructions = "Focus your insights on general scouting, statistics, and value for money."

    prompt = f"""
You are the AI brain for a cricket analytics platform called "Third Man".
The user asked: "{user_query}"

I executed a database search and found the following top players:
{players_text}

{module_instructions}

Your job is to:
1. Provide a highly detailed, analytical paragraph explaining EXACTLY why these specific players are good suggestions for the user's query. 
   - Highlight the player names using HTML bold tags, like <b>Virat Kohli</b>.
   - Compare them briefly in the context of the current dashboard.
   - Mention their specific stats (like Average, Strike Rate, or Injury Risk) and why it fits the archetype the user asked for.
   - If they aren't perfect fits, explain what compromises were made.
2. Suggest 2 highly relevant, human-like follow-up actions a coach might want to ask next, based specifically on these found players and the CURRENT DASHBOARD CONTEXT. (e.g. if in Injury dashboard: "Find safe low-risk replacements for Bumrah"). Make them sound like a natural conversation continuation.

Return your response as JSON matching the schema, with `insights` containing your detailed paragraph, and `actions` containing the list of 2 strings.
"""

    def _call_content(api_key: str):
        client = genai.Client(api_key=api_key)
        config = {
            "response_mime_type": "application/json",
            "response_schema": AIInsightResponse,
            "temperature": 0.4,
        }
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        if not response.text:
            raise ValueError("Gemini returned empty response")
        return response.text
    
    try:
        raw_response = key_manager.execute_with_retry(_call_content)
        parsed = json.loads(raw_response)
        return {
            "insights": parsed.get("insights", "I have found these players based on your criteria."),
            "actions": parsed.get("actions", [])
        }
    except Exception as e:
        print(f"Error generating insights: {e}")
        return {
            "insights": "I have found these players based on your criteria. Please review their specific stats in the table.",
            "actions": []
        }

def generate_elastic_query(user_query: str) -> dict:
    prompt = f"""
You are the AI brain for a cricket analytics platform called "Third Man".
You are an expert cricket analyst with deep knowledge of player roles, batting positions, bowling types, team compositions, and match strategy across all formats (T20, ODI, Test).

The user asked: "{user_query}"

Your job is to:
1. **Reasoning**: Explain your cricket-specific reasoning. If the user asks to "replace" or "find similar to" a player, explain what attributes define that player's role and what you're searching for. If they mention a batting position (e.g. "number 3"), map it to the right player archetype (e.g. number 3 in ODI = anchor batsman with high avg, good SR, plays spin well).
2. **Steps**: List 2-3 brief execution steps you performed to fulfill this.
3. **Elastic Query**: Generate a valid Elasticsearch JSON query for the index "thirdman-players".

CRICKET KNOWLEDGE for query generation:
- Batting positions: Opener (aggressive, high SR), #3 (anchor, highest avg), #4-5 (middle order, balance of avg+SR), finisher (very high SR, lower avg)
- "Replace Kohli at #3" means: find BAT role players with avg > 35, sr > 125, rating > 7, injuryRisk < 60
- "Death bowlers" = PACE with high bowling stats
- "Powerplay specialist" = aggressive BAT or PACE bowlers
- "All-rounder" = role ALL
- When user says "low injury risk", use injuryRisk < 30. "High risk" = injuryRisk > 60.
- Teams: IND, AUS, ENG, PAK, SA, NZ, SL, WI, BAN, AFG, IRE, ZIM, UAE, MAS, etc.

The Elasticsearch mapping is:
- id (keyword)
- name (text, with .keyword sub-field)
- team (keyword) — country codes like IND, AUS, ENG, PAK
- role (keyword) — one of: BAT, PACE, SPIN, ALL, WK-BAT
- age (integer)
- avg (float) — batting average
- sr (float) — strike rate
- rating (float) — overall player rating 0-10
- injuryRisk (integer) — 0 to 100, lower is better
- radarProfile (array of 6 integers) — [BAT AVG, PWR HIT, SPIN PLAY, PACE BOWL, DEATH BOWL, FIELDING]

QUERY RULES:
- Use "bool" queries with "must", "should", "filter" clauses.
- For range filters use "range" with "gte", "lte", "gt", "lt".
- For role filtering use "term" on "role".
- For team filtering use "term" on "team".
- For name search use "match" on "name".
- Always add a "sort" clause to rank by the most relevant metric (e.g. sort by avg desc for batsmen, by rating desc generally).
- Return at most 20 results using "size".
- IMPORTANT: The elastic_query must be the FULL query body including "query", "sort", and "size" keys.

CRITICAL: Return your response as JSON matching the schema. The `elastic_query` field MUST be a string containing valid stringified JSON. Escape all inner quotes properly.

Example for "find top rated batsmen with low injury risk":
elastic_query should stringify to: {{"query":{{"bool":{{"must":[{{"term":{{"role":"BAT"}}}},{{"range":{{"injuryRisk":{{"lte":30}}}}}}]}}}},"sort":[{{"rating":{{"order":"desc"}}}}],"size":20}}
"""
    
    def _call_content(api_key: str):
        client = genai.Client(api_key=api_key)
        
        config = {
            "response_mime_type": "application/json",
            "response_schema": AIChatResponse,
            "temperature": 0.3,
        }

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )

        if not response.text:
            raise ValueError("Gemini returned empty response")
        return response.text
    
    raw_response = key_manager.execute_with_retry(_call_content)
    parsed = json.loads(raw_response)
    
    try:
        if isinstance(parsed.get("elastic_query"), str):
            parsed["elastic_query"] = json.loads(parsed["elastic_query"])
    except:
        parsed["elastic_query"] = {"match_all": {}}
        
    return parsed


VALID_FIELD_POSITIONS = [
    "Wicket Keeper", "First Slip", "Second Slip", "Third Slip", "Gully",
    "Leg Slip", "Short Leg", "Silly Point", "Point", "Cover", "Extra Cover",
    "Mid-off", "Mid-on", "Mid-wicket", "Square Leg", "Fine Leg", "Third Man",
    "Backward Point", "Deep Point", "Deep Cover", "Long-off", "Long-on",
    "Deep Mid-wicket", "Deep Square Leg", "Cow Corner", "Deep Fine Leg",
    "Deep Third Man", "Long Leg", "Sweeper Cover"
]

class CounterStrategyResponse(BaseModel):
    counter_player: str
    approach: str
    summary: str
    field_positions: List[str]
    key_tactics: List[str]

_counter_cache: dict = {}

def generate_counter_strategy(threat: dict, home_squad: List[dict]) -> dict:
    threat_name = threat.get("name", "Unknown")
    threat_role = threat.get("role", "BAT")
    threat_avg = threat.get("avg", 0)

    # Server-side cache keyed by threat name + role + squad hash
    squad_key = ",".join(sorted([p.get("name", "") for p in home_squad[:5]]))
    cache_key = f"{threat_name}|{threat_role}|{squad_key}"
    if cache_key in _counter_cache:
        return _counter_cache[cache_key]
    threat_sr = threat.get("sr", 0)

    squad_text = "\n".join([
        f"- {p.get('name')} ({p.get('role')}, Avg {p.get('avg')}, SR {p.get('sr')}, Rating {p.get('rating')}, Risk {p.get('injuryRisk')}%)"
        for p in home_squad[:15]
    ])

    is_bat_threat = threat_role in ("BAT", "ALL", "WK-BAT")
    positions_list = ", ".join(VALID_FIELD_POSITIONS)

    if is_bat_threat:
        prompt = f"""You are an elite cricket tactician for the "Third Man" analytics platform.

THREAT BATSMAN: {threat_name} (Role: {threat_role}, Avg: {threat_avg}, SR: {threat_sr})

OUR AVAILABLE SQUAD:
{squad_text}

TASK: Create a bowling & fielding counter-strategy to neutralize {threat_name}.

1. **counter_player**: Pick ONE bowler from our squad best suited to bowl at this batsman.
2. **approach**: One sentence on the bowling plan (e.g. "Short-pitched aggressive pace outside off stump").
3. **summary**: 2-3 sentence tactical overview of how to restrict this batsman.
4. **field_positions**: Pick EXACTLY 9 fielding positions from this list: [{positions_list}]. These are the 9 fielders (excluding bowler and wicket keeper). Choose positions that support your bowling plan.
5. **key_tactics**: 3-4 specific, actionable tactical bullet points.

CRITICAL: field_positions must contain EXACTLY 9 strings, each from the valid list above. No duplicates.
Return as JSON matching the schema."""
    else:
        prompt = f"""You are an elite cricket tactician for the "Third Man" analytics platform.

THREAT BOWLER: {threat_name} (Role: {threat_role}, Avg: {threat_avg}, SR: {threat_sr})

OUR AVAILABLE SQUAD:
{squad_text}

TASK: Create a batting counter-strategy to neutralize {threat_name}.

1. **counter_player**: Pick ONE batsman from our squad best suited to face this bowler.
2. **approach**: One sentence on the batting plan (e.g. "Rotate strike, target boundaries only against the shorter ball").
3. **summary**: 2-3 sentence tactical overview of how our batsman should play this bowler.
4. **field_positions**: Return an EMPTY list []. Field placement is not relevant when countering a bowler.
5. **key_tactics**: 3-4 specific, actionable tactical bullet points focused on batting approach, shot selection, and scoring areas.

CRITICAL: field_positions must be an empty list.
Return as JSON matching the schema."""

    def _call(api_key: str):
        client = genai.Client(api_key=api_key)
        config = {
            "response_mime_type": "application/json",
            "response_schema": CounterStrategyResponse,
            "temperature": 0.4,
        }
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        if not response.text:
            raise ValueError("Empty response")
        return response.text

    try:
        raw = key_manager.execute_with_retry(_call)
        parsed = json.loads(raw)
        # Validate field positions
        valid = [p for p in parsed.get("field_positions", []) if p in VALID_FIELD_POSITIONS]
        parsed["field_positions"] = valid[:9]
        # Cache the result
        _counter_cache[cache_key] = parsed
        return parsed
    except Exception as e:
        print(f"Error generating counter strategy: {e}")
        return {
            "counter_player": "N/A",
            "approach": "Unable to generate strategy.",
            "summary": "An error occurred while generating the counter strategy.",
            "field_positions": ["Wicket Keeper", "First Slip", "Second Slip", "Gully", "Point", "Cover", "Mid-off", "Mid-on", "Fine Leg"],
            "key_tactics": ["Review player matchups manually."]
        }
