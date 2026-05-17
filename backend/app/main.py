from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import structlog

from app.config import settings
from app.db.session import get_db
from app.db.models import Document, Jurisdiction

from app.api.routes import crawl, documents, clauses, search, export, audit, health
from app.db.session import engine, Base

# Sentry error tracking
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.celery import CeleryIntegration

# Prometheus metrics
from prometheus_fastapi_instrumentator import Instrumentator

logger = structlog.get_logger(__name__)

# Initialize Sentry
if getattr(settings, "SENTRY_DSN", None):
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlalchemyIntegration(),
            CeleryIntegration(),
        ],
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
    )

app = FastAPI(
    title="RegScope Engine",
    description="Automated Cross-Border Data Compliance Intelligence",
    version="0.1.0"
)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus instrumentation
if getattr(settings, "PROMETHEUS_ENABLED", False):
    Instrumentator(
        should_group_status_codes=True,
        excluded_handlers=["/health", "/metrics"],
    ).instrument(app).expose(app, endpoint="/metrics")

app.include_router(health.router)
app.include_router(crawl.router, prefix="/api/v1/crawl", tags=["Crawl"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(clauses.router, prefix="/api/v1", tags=["clauses"])
app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(export.router, prefix="/api/v1", tags=["export"])
app.include_router(audit.router, prefix="/api/v1", tags=["audit"])

@app.get("/")
async def root():
    return {"status": "ok", "message": "RegScope API is online. Use /api/v1/search for queries."}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "RegScope Engine API is running."}

@app.get("/api/v1/jurisdictions/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            Jurisdiction.name,
            Jurisdiction.code,
            func.count(Document.id).label("doc_count")
        ).join(Document, isouter=True).group_by(Jurisdiction.id)
    )
    return [
        {"name": row.name, "code": row.code, "doc_count": row.doc_count} 
        for row in result
    ]
