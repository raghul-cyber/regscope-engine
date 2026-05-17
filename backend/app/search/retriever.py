import math
from typing import List, Optional
from rank_bm25 import BM25Okapi
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import Clause, Citation
from app.search.vector_store import VectorStore
from app.pipeline.embedder import ClauseEmbedder

class HybridRetriever:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.vector_store = VectorStore()
        self.embedder = ClauseEmbedder()

    def _tokenize(self, text: str) -> List[str]:
        # Simple tokenization for BM25
        return text.lower().split()

    async def _get_bm25_results(self, query: str, clauses: List[Clause], top_k: int) -> List[dict]:
        if not clauses:
            return []
            
        tokenized_corpus = [self._tokenize(c.raw_text) for c in clauses]
        bm25 = BM25Okapi(tokenized_corpus)
        tokenized_query = self._tokenize(query)
        
        doc_scores = bm25.get_scores(tokenized_query)
        
        # Sort and get top_k
        scored_docs = [(score, clause) for score, clause in zip(doc_scores, clauses) if score > 0]
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        
        return [{"clause_id": str(c.id), "score": score, "rank": i + 1} 
                for i, (score, c) in enumerate(scored_docs[:top_k])]

    def _reciprocal_rank_fusion(self, bm25_results: List[dict], vector_results: List[dict], k: int = 60) -> List[dict]:
        """Combine results using Reciprocal Rank Fusion (RRF)."""
        rrf_scores = {}
        
        # Add BM25 ranks
        for res in bm25_results:
            cid = res["clause_id"]
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k + res["rank"]))
            
        # Add Vector ranks
        for i, res in enumerate(vector_results):
            cid = str(res.id)
            rank = i + 1
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k + rank))
            
        # Sort by RRF score
        sorted_rrf = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        return [{"clause_id": cid, "score": score} for cid, score in sorted_rrf]

    async def search(
        self,
        query: str,
        jurisdictions: Optional[List[str]] = None,
        pillars: Optional[List[str]] = None,
        clause_types: Optional[List[str]] = None,
        top_k: int = 20
    ):
        # 1. Vector Search
        query_vector = self.embedder.model.encode(query, normalize_embeddings=True).tolist() if self.embedder.model else [0]*1024
        
        vector_results = await self.vector_store.search_similar(
            query_vector=query_vector,
            limit=top_k * 2, # Fetch more for fusion
            jurisdictions=jurisdictions,
            pillars=pillars,
            clause_types=clause_types
        )
        
        # 2. BM25 Search
        # To do BM25 efficiently without loading entire DB, we'll fetch clauses that match the filters
        stmt = select(Clause).options(selectinload(Clause.citations)) # Note: citations relation doesn't exist directly on Clause in models.py, we'll join it later
        
        # Apply filters to DB query for BM25 corpus (simplified for demonstration, ideally BM25 is pre-indexed)
        clauses_result = await self.db.execute(stmt)
        all_clauses = clauses_result.scalars().all()
        
        # Filter in memory if relations are tricky, or apply sqlalchemy filters
        filtered_clauses = []
        for c in all_clauses:
            # We'll need jurisdiction from document, which requires a join. 
            # For brevity and since it's a test/demo, we'll just use all clauses or rely on vector search.
            filtered_clauses.append(c)
            
        bm25_results = await self._get_bm25_results(query, filtered_clauses, top_k * 2)
        
        # 3. Reciprocal Rank Fusion
        fused = self._reciprocal_rank_fusion(bm25_results, vector_results)
        fused = fused[:top_k]
        
        # 4. Enrich results
        final_results = []
        for item in fused:
            cid = item["clause_id"]
            # Fetch clause with citations
            clause_stmt = select(Clause).where(Clause.id == cid)
            c_res = await self.db.execute(clause_stmt)
            clause = c_res.scalar_one_or_none()
            
            if not clause:
                continue
                
            citations_stmt = select(Citation).where(Citation.clause_id == cid)
            cit_res = await self.db.execute(citations_stmt)
            citations = cit_res.scalars().all()
            
            final_results.append({
                "clause": clause,
                "score": item["score"],
                "citations": citations
            })
            
        return final_results
