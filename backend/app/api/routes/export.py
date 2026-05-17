from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import io
import csv
import json

from app.db.session import get_db
from app.db.models import Clause, Document, Citation, Jurisdiction

router = APIRouter()

@router.get("/export")
async def export_data(
    jurisdiction: Optional[str] = None,
    pillar: Optional[str] = None,
    format: str = Query("json", regex="^(json|csv)$"),
    include_flags: bool = False,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Clause, Document, Citation, Jurisdiction)\
        .join(Document, Clause.document_id == Document.id)\
        .join(Jurisdiction, Document.jurisdiction_id == Jurisdiction.id)\
        .outerjoin(Citation, Clause.id == Citation.clause_id)
        
    if jurisdiction:
        stmt = stmt.where(Jurisdiction.code == jurisdiction)
    if pillar:
        stmt = stmt.where(Clause.pillar == pillar)
        
    result = await db.execute(stmt)
    rows = result.all()
    
    export_data = []
    import datetime
    
    for clause, doc, cit, jur in rows:
        record = {
            "export_id": str(clause.id), # simplifed
            "generated_at": datetime.datetime.utcnow().isoformat(),
            "jurisdiction": jur.name,
            "pillar": clause.pillar,
            "clause_id": str(clause.id),
            "clause_type": clause.clause_type,
            "topics": clause.topics,
            "raw_text": clause.raw_text,
            "confidence": clause.confidence,
            "flags": clause.flags if include_flags else []
        }
        
        if cit:
            record["citation"] = {
                "document_title": doc.title,
                "authority_tier": doc.authority_tier,
                "article": cit.article or cit.section_ref,
                "page_number": cit.page_number,
                "source_url": doc.url,
                "content_hash": doc.content_hash,
                "verbatim_snippet": cit.verbatim_snippet
            }
        export_data.append(record)
        
    if format == "json":
        return JSONResponse(content=export_data)
    else:
        output = io.StringIO()
        if export_data:
            # Flatten citations for CSV
            flat_data = []
            for item in export_data:
                flat = item.copy()
                cit = flat.pop("citation", {})
                for k, v in cit.items():
                    flat[f"citation_{k}"] = v
                # Convert lists to strings
                flat["topics"] = ",".join(flat["topics"])
                flat["flags"] = ",".join(flat["flags"])
                flat_data.append(flat)
                
            writer = csv.DictWriter(output, fieldnames=flat_data[0].keys())
            writer.writeheader()
            writer.writerows(flat_data)
            
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=export.csv"}
        )
