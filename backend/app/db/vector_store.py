import uuid
from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.config import settings

class VectorStore:
    def __init__(self):
        # Use localhost for scripts/local dev, service name for docker
        self.client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        self.collection_name = settings.QDRANT_COLLECTION
        self._ensure_collection()

    def _ensure_collection(self):
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            # We use 384 for local testing (MiniLM) and 1024 for production (E5-large)
            # Check current model to decide dimension or just use 384 for now
            dim = 384 
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=dim, distance=models.Distance.COSINE),
            )

    def upsert_clauses(self, clause_ids: List[uuid.UUID], vectors: List[List[float]], payloads: List[Dict[str, Any]]):
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=str(cid),
                    vector=vec,
                    payload=payload
                )
                for cid, vec, payload in zip(clause_ids, vectors, payloads)
            ]
        )

    def search_similar(self, query_vector: List[float], limit: int = 5, filters: Optional[Any] = None):
        return self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit,
            query_filter=filters
        ).points
