import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.db.models import Clause, Citation, Document, Section, Jurisdiction
from app.api.schemas import PaginatedClauses, ClauseWithCitations, ClauseDetailResponse, CitationSchema

router = APIRouter()

@router.get("/clauses", response_model=PaginatedClauses)
async def get_clauses(
    jurisdiction: Optional[str] = None,
    pillar: Optional[str] = None,
    clause_type: Optional[str] = None,
    topic: Optional[str] = None,
    confidence_min: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Clause)
    
    if jurisdiction:
        # Join document to filter by jurisdiction code
        stmt = stmt.join(Document, Clause.document_id == Document.id).join(Jurisdiction, Document.jurisdiction_id == Jurisdiction.id).where(Jurisdiction.code == jurisdiction)
    
    if pillar:
        stmt = stmt.where(Clause.pillar == pillar)
    if clause_type:
        stmt = stmt.where(Clause.clause_type == clause_type)
    if topic:
        stmt = stmt.where(Clause.topics.contains([topic]))
    if confidence_min is not None:
        stmt = stmt.where(Clause.confidence >= confidence_min)
        
    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0
    
    # Pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    clauses = result.scalars().all()
    
    items = []
    for clause in clauses:
        # fetch citations
        cit_stmt = select(Citation).where(Citation.clause_id == clause.id)
        cit_res = await db.execute(cit_stmt)
        citations = cit_res.scalars().all()
        
        cit_schemas = [CitationSchema.model_validate(c) for c in citations]
        
        items.append(ClauseWithCitations(
            id=clause.id,
            raw_text=clause.raw_text,
            pillar=clause.pillar,
            clause_type=clause.clause_type,
            topics=clause.topics,
            confidence=clause.confidence,
            flags=clause.flags,
            citations=cit_schemas
        ))
        
    return PaginatedClauses(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/clauses/{id}", response_model=ClauseDetailResponse)
async def get_clause_detail(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Clause).where(Clause.id == id)
    result = await db.execute(stmt)
    clause = result.scalar_one_or_none()
    
    if not clause:
        raise HTTPException(status_code=404, detail="Clause not found")
        
    cit_stmt = select(Citation).where(Citation.clause_id == clause.id)
    cit_res = await db.execute(cit_stmt)
    citations = cit_res.scalars().all()
    cit_schemas = [CitationSchema.model_validate(c) for c in citations]
    
    # fetch section
    sec_stmt = select(Section).where(Section.id == clause.section_id)
    sec_res = await db.execute(sec_stmt)
    section = sec_res.scalar_one_or_none()
    
    # fetch document
    doc_stmt = select(Document).where(Document.id == clause.document_id)
    doc_res = await db.execute(doc_stmt)
    document = doc_res.scalar_one_or_none()
    
    return ClauseDetailResponse(
        id=clause.id,
        raw_text=clause.raw_text,
        pillar=clause.pillar,
        clause_type=clause.clause_type,
        topics=clause.topics,
        confidence=clause.confidence,
        flags=clause.flags,
        citations=cit_schemas,
        section={"heading": section.heading, "section_number": section.section_number} if section else {},
        document={"title": document.title, "authority_tier": document.authority_tier} if document else {}
    )
