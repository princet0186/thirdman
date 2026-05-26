import os
import json
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

ELASTIC_CLOUD_ID = os.getenv("ELASTIC_CLOUD_ID")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")

if not ELASTIC_CLOUD_ID or not ELASTIC_API_KEY:
    print("Error: Please set ELASTIC_CLOUD_ID and ELASTIC_API_KEY in the .env file")
    exit(1)

es = Elasticsearch(
    cloud_id=ELASTIC_CLOUD_ID,
    api_key=ELASTIC_API_KEY
)

INDEX_NAME = "thirdman-players"

def load_data():
    try:
        info = es.info()
        print(f"Connected to Elasticsearch cluster: {info.body.get('cluster_name', 'Unknown')}")
    except Exception as e:
        print(f"Failed to connect to Elasticsearch: {e}")
        return

    if es.indices.exists(index=INDEX_NAME):
        print(f"Deleting existing index: {INDEX_NAME}")
        es.indices.delete(index=INDEX_NAME)

    mappings = {
        "properties": {
            "id": {"type": "keyword"},
            "name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
            "team": {"type": "keyword"},
            "role": {"type": "keyword"},
            "age": {"type": "integer"},
            "avg": {"type": "float"},
            "sr": {"type": "float"},
            "rating": {"type": "float"},
            "injuryRisk": {"type": "integer"},
            "workloadData": {
                "type": "nested",
                "properties": {
                    "month": {"type": "keyword"},
                    "risk": {"type": "integer"},
                    "workload": {"type": "integer"}
                }
            },
            "radarProfile": {"type": "integer"}
        }
    }

    es.indices.create(index=INDEX_NAME, mappings=mappings)
    print(f"Created index: {INDEX_NAME}")

    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "players_database.json")
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}")
        return

    with open(data_path, "r") as f:
        players = json.load(f)

    operations = []
    for player in players:
        operations.append({"index": {"_index": INDEX_NAME, "_id": player["id"]}})
        operations.append(player)

    if operations:
        response = es.bulk(operations=operations)
        if response.get("errors"):
            print("Errors occurred during bulk insert.")
            for item in response["items"]:
                if "error" in item["index"]:
                    print(item["index"]["error"])
        else:
            print(f"Successfully loaded {len(players)} players into {INDEX_NAME}")

if __name__ == "__main__":
    load_data()
