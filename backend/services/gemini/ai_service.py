from google import genai
from pydantic import BaseModel
from typing import List
import json

from backend.services.gemini.key_manager import key_manager

class AIChatResponse(BaseModel):
    reasoning: str
    steps: List[str]
    actions: List[str]
    elastic_query: str

def generate_elastic_query(user_query: str) -> dict:
    prompt = f"""
You are the AI brain for a cricket analytics dashboard called Third Man.
The user asked: "{user_query}"

Your job is to:
1. Explain your reasoning for how you will fulfill this request.
2. List the execution steps you took.
3. Suggest 2 recommended actions for the coach to take next.
4. Generate a valid Elasticsearch JSON query to fetch the requested players from an index named "thirdman-players".

The Elasticsearch mapping is:
- id (keyword)
- name (text)
- team (keyword)
- role (keyword: BAT, PACE, SPIN, ALL, WK-BAT)
- age (integer)
- avg (float)
- sr (float)
- rating (float)
- injuryRisk (integer, 0-100)

CRITICAL RULE: Return your response as JSON matching the schema. The `elastic_query` MUST be a string containing valid stringified JSON (escape quotes properly). For example: "{{\\"query\\": {{\\"match_all\\": {{}}}}}}"
"""
    
    def _call_content(api_key: str):
        client = genai.Client(api_key=api_key)
        
        config = {
            "response_mime_type": "application/json",
            "response_schema": AIChatResponse,
            "temperature": 0.2,
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
    
    # Safely parse the elastic_query string back into a dict
    try:
        if isinstance(parsed.get("elastic_query"), str):
            parsed["elastic_query"] = json.loads(parsed["elastic_query"])
    except:
        parsed["elastic_query"] = {"match_all": {}}
        
    return parsed
