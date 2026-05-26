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

def generate_player_insights(user_query: str, players: List[dict]) -> dict:
    if not players:
        return "No players found matching your criteria."

    # Limit to top 5 for the prompt to avoid token bloat
    top_players = players[:5]
    player_summaries = []
    for p in top_players:
        summary = f"- {p.get('name')} ({p.get('team')}, Age {p.get('age')}): Role {p.get('role')}, Avg {p.get('avg')}, SR {p.get('sr')}, Risk {p.get('injuryRisk')}%, Rating {p.get('rating')}"
        player_summaries.append(summary)
    
    players_text = "\n".join(player_summaries)

    prompt = f"""
You are the AI brain for a cricket analytics platform called "Third Man".
The user asked: "{user_query}"

I executed a database search and found the following top players:
{players_text}

Your job is to:
1. Provide a highly detailed, analytical paragraph explaining EXACTLY why these specific players are good suggestions for the user's query. 
   - Highlight the player names using HTML bold tags, like <b>Virat Kohli</b>.
   - Compare them briefly. 
   - Mention their specific stats (like Average or Strike Rate) and why it fits the archetype the user asked for.
   - If they aren't perfect fits, explain what compromises were made.
2. Suggest 2 highly relevant, human-like follow-up actions a coach might want to ask next, based specifically on these found players. (e.g. "How does Babar Azam perform against left-arm spin?" or "Compare these two players' injury risks"). Make them sound like a natural conversation continuation.

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
