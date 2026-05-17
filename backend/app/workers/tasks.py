import structlog
from app.workers.celery_app import celery_app

logger = structlog.get_logger(__name__)

@celery_app.task(bind=True, max_retries=3)
def crawl_jurisdiction(self, jurisdiction_code: str, depth: int):
    logger.info("crawl_jurisdiction_started", jurisdiction=jurisdiction_code, depth=depth)
    # Phase 2 mock implementation
    return {"status": "completed", "jurisdiction": jurisdiction_code}

@celery_app.task(bind=True, max_retries=3)
def ingest_document(self, document_id: str):
    logger.info("ingest_document_started", document_id=document_id)
    # Phase 2 trigger
    return {"status": "completed", "document_id": document_id}

@celery_app.task(bind=True, max_retries=3)
def run_pipeline(self, document_id: str):
    logger.info("run_pipeline_started", document_id=document_id)
    
    import asyncio
    from app.db.session import AsyncSessionLocal
    from app.pipeline.processor import process_document
    
    async def run_async():
        async with AsyncSessionLocal() as session:
            await process_document(session, document_id)
            
    try:
        asyncio.run(run_async())
        return {"status": "completed", "document_id": document_id}
    except Exception as exc:
        logger.error("pipeline_task_failed", document_id=document_id, error=str(exc))
        raise self.retry(exc=exc, countdown=10)

@celery_app.task
def embed_clause(clause_id: str):
    logger.info("embed_clause_started", clause_id=clause_id)
    return {"status": "completed", "clause_id": clause_id}

@celery_app.task
def run_conflict_detection(jurisdiction_code: str):
    logger.info("run_conflict_detection_started", jurisdiction=jurisdiction_code)
    return {"status": "completed", "jurisdiction": jurisdiction_code}
