import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.db.vector_store import VectorStore
from app.pipeline.embedder import ClauseEmbedder

async def test_search():
    vs = VectorStore()
    embedder = ClauseEmbedder()
    
    query = "What are the rules for cross-border data transfer?"
    print(f"\nQuerying: {query}")
    
    # 1. Embed query
    query_vector = embedder.model.encode(query).tolist()
    
    # 2. Search Qdrant
    results = vs.search_similar(query_vector, limit=3)
    
    print("\n--- SEARCH RESULTS ---")
    if not results:
        print("No results found in Qdrant.")
    else:
        for i, res in enumerate(results):
            print(f"{i+1}. Clause ID: {res.id}")
            print(f"   Score: {res.score:.4f}")
            print(f"   Payload: {res.payload}")
            print("-" * 20)

if __name__ == "__main__":
    asyncio.run(test_search())
