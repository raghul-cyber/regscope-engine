import uuid
from typing import List, Optional
import structlog
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue, MatchAny

from app.config import settings
from app.db.models import Clause

logger = structlog.get_logger(__name__)

class VectorStore:
    def __init__(self):
        self.client = AsyncQdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
            api_key=settings.QDRANT_API_KEY,
            https=True if settings.QDRANT_PORT == 443 else False
        )
        self.collection_name = settings.QDRANT_COLLECTION

    async def initialize_collection(self):
        """Initializes the Qdrant collection if it doesn't exist."""
        try:
            exists = await self.client.collection_exists(self.collection_name)
            if not exists:
                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=1024, # e5-large vector size
                        distance=Distance.COSINE
                    )
                )
                logger.info("qdrant_collection_created", collection=self.collection_name)
        except Exception as e:
            logger.error("qdrant_initialization_error", error=str(e))

    async def get_collection_info(self):
        """Get collection info for health checks."""
        return await self.client.get_collection(self.collection_name)

    async def upsert_clause(
        self,
        clause_id: uuid.UUID,
        vector: List[float],
        jurisdiction: str,
        pillar: str,
        clause_type: str,
        topics: List[str],
        confidence: float
    ):
        """Upsert a clause embedding and payload into Qdrant."""
        try:
            point = PointStruct(
                id=str(clause_id),
                vector=vector,
                payload={
                    "jurisdiction": jurisdiction,
                    "pillar": pillar,
                    "clause_type": clause_type,
                    "topics": topics,
                    "confidence": confidence
                }
            )
            await self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            logger.info("qdrant_point_upserted", clause_id=str(clause_id))
        except Exception as e:
            logger.error("qdrant_upsert_error", clause_id=str(clause_id), error=str(e))

    async def search_similar(
        self,
        query_vector: List[float],
        limit: int = 20,
        jurisdictions: Optional[List[str]] = None,
        pillars: Optional[List[str]] = None,
        clause_types: Optional[List[str]] = None
    ):
        """Search for similar clauses with optional filtering."""
        try:
            must_conditions = []
            
            if jurisdictions:
                must_conditions.append(
                    FieldCondition(key="jurisdiction", match=MatchAny(any=jurisdictions))
                )
            if pillars:
                must_conditions.append(
                    FieldCondition(key="pillar", match=MatchAny(any=pillars))
                )
            if clause_types:
                must_conditions.append(
                    FieldCondition(key="clause_type", match=MatchAny(any=clause_types))
                )
            
            query_filter = Filter(must=must_conditions) if must_conditions else None
                
            results = await self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=limit
            )
            return results
        except Exception as e:
            logger.error("qdrant_search_error", error=str(e))
            return []
