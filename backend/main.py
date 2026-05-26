import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from pydantic import BaseModel
from services.gemini.ai_service import generate_elastic_query, generate_player_insights

load_dotenv()

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")

app = FastAPI(title="Third Man API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    es = Elasticsearch(
        cloud_id=ELASTIC_CLOUD_ID,
        api_key=ELASTIC_API_KEY
    )
except Exception as e:
    es = None

INDEX_NAME = "thirdman-players"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Third Man API is running"}

@app.get("/api/players")
def get_players(role: str = None, limit: int = 100):
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
        
    query = {"match_all": {}}
    if role:
        query = {"term": {"role": role}}
        
    try:
        res = es.search(index=INDEX_NAME, query=query, size=limit)
        players = [hit["_source"] for hit in res["hits"]["hits"]]
        return {"total": res["hits"]["total"]["value"], "players": players}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/players/{player_id}")
def get_player(player_id: str):
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
        
    try:
        res = es.get(index=INDEX_NAME, id=player_id)
        return res["_source"]
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")

@app.get("/api/search")
def search_players(q: str):
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
        
    try:
        res = es.search(
            index=INDEX_NAME, 
            query={
                "multi_match": {
                    "query": q,
                    "fields": ["name^3", "role", "team"],
                    "fuzziness": "AUTO"
                }
            },
            size=20
        )
        players = [hit["_source"] for hit in res["hits"]["hits"]]
        return {"results": players}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats/injury-distribution")
def get_injury_distribution():
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
    try:
        res = es.search(index=INDEX_NAME, query={"match_all": {}}, size=200)
        players = [hit["_source"] for hit in res["hits"]["hits"]]
        low = len([p for p in players if p.get("injuryRisk", 0) < 30])
        med = len([p for p in players if 30 <= p.get("injuryRisk", 0) < 60])
        high = len([p for p in players if p.get("injuryRisk", 0) >= 60])
        high_risk_players = sorted(
            [p for p in players if p.get("injuryRisk", 0) >= 50],
            key=lambda x: x.get("injuryRisk", 0),
            reverse=True
        )[:15]
        return {"low": low, "medium": med, "high": high, "highRiskPlayers": high_risk_players, "total": len(players)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats/role-distribution")
def get_role_distribution():
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
    try:
        res = es.search(index=INDEX_NAME, query={"match_all": {}}, size=200)
        players = [hit["_source"] for hit in res["hits"]["hits"]]
        roles = {}
        for p in players:
            r = p.get("role", "UNKNOWN")
            roles[r] = roles.get(r, 0) + 1
        teams = {}
        for p in players:
            t = p.get("team", "UNK")
            teams[t] = teams.get(t, 0) + 1
        return {"roles": roles, "teams": teams, "total": len(players)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
def chat_with_ai(request: ChatRequest):
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
        
    try:
        ai_response = generate_elastic_query(request.query)
        es_query_body = ai_response.get("elastic_query", {})
        
        search_kwargs = {"index": INDEX_NAME}
        
        if isinstance(es_query_body, dict):
            if "query" in es_query_body:
                search_kwargs["query"] = es_query_body["query"]
            else:
                search_kwargs["query"] = es_query_body
            
            if "sort" in es_query_body:
                search_kwargs["sort"] = es_query_body["sort"]
            if "size" in es_query_body:
                search_kwargs["size"] = es_query_body["size"]
            else:
                search_kwargs["size"] = 20
        else:
            search_kwargs["query"] = {"match_all": {}}
            search_kwargs["size"] = 20
        
        res = es.search(**search_kwargs)
        players = [hit["_source"] for hit in res["hits"]["hits"]]
        
        insight_data = generate_player_insights(request.query, players)
        ai_response["insights"] = insight_data.get("insights", "")
        ai_response["actions"] = insight_data.get("actions", [])
        
        return {
            "ai": ai_response,
            "players": players
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
