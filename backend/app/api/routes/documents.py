import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.db.models import Document, Jurisdiction
from app.api.schemas import PaginatedDocuments, DocumentSummary

router = APIRouter()

@router.get("/documents", response_model=PaginatedDocuments)
async def get_documents(
    jurisdiction: Optional[str] = None,
    doc_type: Optional[str] = None,
    authority_tier: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document)
    
    if jurisdiction:
        j_stmt = select(Jurisdiction.id).where(Jurisdiction.code == jurisdiction)
        j_res = await db.execute(j_stmt)
        j_id = j_res.scalar_one_or_none()
        if j_id:
            stmt = stmt.where(Document.jurisdiction_id == j_id)
            
    if doc_type:
        stmt = stmt.where(Document.doc_type == doc_type)
    if authority_tier:
        stmt = stmt.where(Document.authority_tier == authority_tier)
        
    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0
    
    # Pagination
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    documents = result.scalars().all()
    
    items = [DocumentSummary.model_validate(doc) for doc in documents]
    
    return PaginatedDocuments(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )
