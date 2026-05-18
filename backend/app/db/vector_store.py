import uuid
from typing import List, Optional, Dict, Any
from qdrant_client import QdrantClient
from qdrant_client.http import models
from app.config import settings

class VectorStore:
    def __init__(self):
        # Build robust URL for Qdrant client
        host = settings.QDRANT_HOST
        if host.startswith("http://") or host.startswith("https://"):
            url = host
        else:
            scheme = "https" if settings.QDRANT_PORT == 443 else "http"
            url = f"{scheme}://{host}"
            if settings.QDRANT_PORT and settings.QDRANT_PORT != 80 and settings.QDRANT_PORT != 443:
                url = f"{url}:{settings.QDRANT_PORT}"

        self.client = QdrantClient(
            url=url,
            api_key=settings.QDRANT_API_KEY
        )
        self.collection_name = settings.QDRANT_COLLECTION
        self._ensure_collection()

    def _ensure_collection(self):
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            # Dynamically set vector size based on model
            dim = 1024 if "e5-large" in settings.EMBEDDING_MODEL else 384
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
