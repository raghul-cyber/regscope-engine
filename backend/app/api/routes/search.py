from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.schemas import SearchRequest, SearchResponse, SearchResultItem, ClauseWithCitations, CitationSchema
from app.search.retriever import HybridRetriever

router = APIRouter()

@router.post("/search", response_model=SearchResponse)
async def search_clauses(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    retriever = HybridRetriever(db)
    
    raw_results = await retriever.search(
        query=request.query,
        jurisdictions=request.jurisdictions,
        pillars=request.pillars,
        top_k=request.top_k
    )
    
    results = []
    for item in raw_results:
        clause = item["clause"]
        score = item["score"]
        citations = item["citations"]
        
        cit_schemas = []
        for cit in citations:
            cit_schemas.append(CitationSchema(
                id=cit.id,
                article=cit.article,
                section_ref=cit.section_ref,
                page_number=cit.page_number,
                verbatim_snippet=cit.verbatim_snippet,
                source_url=None, # Need to join with document to get url
                content_hash=None
            ))
            
        clause_with_cits = ClauseWithCitations(
            id=clause.id,
            raw_text=clause.raw_text,
            pillar=clause.pillar,
            clause_type=clause.clause_type,
            topics=clause.topics,
            confidence=clause.confidence,
            flags=clause.flags,
            citations=cit_schemas
        )
        
        results.append(SearchResultItem(clause=clause_with_cits, score=score))
        
    return SearchResponse(results=results)
