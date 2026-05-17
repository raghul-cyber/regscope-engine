import uuid
from typing import List, Optional
import structlog
from app.db.models import ClauseEmbedding

logger = structlog.get_logger(__name__)

class ClauseEmbedder:
    def __init__(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logger.warning("sentence_transformers_not_loaded", error=str(e))
            self.model = None
            
    def embed_clause(self, clause_id: uuid.UUID, raw_text: str) -> Optional[ClauseEmbedding]:
        if not self.model:
            return None
            
        vector = self.model.encode([raw_text], normalize_embeddings=True)[0]
        
        return ClauseEmbedding(
            id=uuid.uuid4(),
            clause_id=clause_id,
            vector=vector.tolist(),
            model_name="intfloat/multilingual-e5-large"
        )
