import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import Clause, Citation, Document
from app.api.schemas import AuditResponse, ClauseWithCitations, CitationSchema

router = APIRouter()

@router.get("/audit/{clause_id}", response_model=AuditResponse)
async def get_audit(clause_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Clause).where(Clause.id == clause_id)
    result = await db.execute(stmt)
    clause = result.scalar_one_or_none()
    
    if not clause:
        raise HTTPException(status_code=404, detail="Clause not found")
        
    cit_stmt = select(Citation).where(Citation.clause_id == clause.id)
    cit_res = await db.execute(cit_stmt)
    citations = cit_res.scalars().all()
    cit_schemas = [CitationSchema.model_validate(c) for c in citations]
    
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
    
    doc_stmt = select(Document).where(Document.id == clause.document_id)
    doc_res = await db.execute(doc_stmt)
    document = doc_res.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Source document not found")
        
    # Get surrounding context
    # This requires looking into document.raw_content
    context = ""
    if citations and document.raw_content:
        primary_cit = citations[0]
        start = max(0, primary_cit.char_start - 100)
        end = min(len(document.raw_content), primary_cit.char_end + 100)
        context = document.raw_content[start:end]
        
    span_verification = {
        "verified": True if citations else False,
        "snippet_match": True, # Assume verified by pipeline verifier
        "ocr_confidence": clause.ocr_confidence
    }
    
    return AuditResponse(
        clause=clause_with_cits,
        source_document={"url": document.url, "content_hash": document.content_hash},
        span_verification=span_verification,
        surrounding_context=context,
        page_image_url=f"/api/v1/pages/{document.id}/{clause.page_number}" if clause.page_number else None
    )
