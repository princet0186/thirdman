import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import Elasticsearch
from dotenv import load_dotenv
from pydantic import BaseModel
from backend.services.gemini.ai_service import generate_elastic_query

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

class ChatRequest(BaseModel):
    query: str

@app.post("/api/chat")
def chat_with_ai(request: ChatRequest):
    if not es:
        raise HTTPException(status_code=503, detail="Elasticsearch connection not configured")
        
    try:
        ai_response = generate_elastic_query(request.query)
        es_query = ai_response.get("elastic_query", {"match_all": {}})
        
        res = es.search(index=INDEX_NAME, query=es_query.get("query", es_query), size=20)
        players = [hit["_source"] for hit in res["hits"]["hits"]]
        
        return {
            "ai": ai_response,
            "players": players
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
