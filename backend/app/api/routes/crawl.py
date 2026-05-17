import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import CrawlJob, Jurisdiction
from app.api.schemas import CrawlRequest, CrawlResponse, JobStatusResponse

router = APIRouter()

@router.post("/crawl", response_model=CrawlResponse)
async def start_crawl(request: CrawlRequest, db: AsyncSession = Depends(get_db)):
    # Verify jurisdiction
    stmt = select(Jurisdiction).where(Jurisdiction.code == request.jurisdiction_code)
    result = await db.execute(stmt)
    jurisdiction = result.scalar_one_or_none()
    
    if not jurisdiction:
        raise HTTPException(status_code=404, detail="Jurisdiction not found")

    job = CrawlJob(
        jurisdiction_id=jurisdiction.id,
        status="pending"
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    # Enqueue task
    try:
        from app.workers.tasks import crawl_jurisdiction
        crawl_jurisdiction.delay(request.jurisdiction_code, request.depth)
    except ImportError:
        pass # Handle if celery is not loaded

    return CrawlResponse(
        job_id=job.id,
        status="pending",
        message="Crawl job queued"
    )

@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(CrawlJob).where(CrawlJob.id == job_id)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Dummy progress calculation
    progress = 1.0 if job.status == 'completed' else (0.5 if job.status == 'running' else 0.0)
        
    return JobStatusResponse(
        job_id=job.id,
        status=job.status,
        documents_found=job.documents_found,
        progress=progress
    )
