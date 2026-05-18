from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.db.session import get_db
from app.search.vector_store import VectorStore
from app.config import settings
import redis.asyncio as aioredis
import time

from sqlalchemy import text

router = APIRouter()

@router.get("/health")
async def health_check():
    """Comprehensive health check for load balancer and monitoring."""
    checks = {}
    start = time.time()

    # Database
    try:
        async for db in get_db():
            await db.execute(text("SELECT 1"))
            break
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {str(e)}"

    # Redis
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        checks["redis"] = "ok"
        await r.close()
    except Exception as e:
        checks["redis"] = f"error: {str(e)}"

    # Qdrant
    try:
        vs = VectorStore()
        info = await vs.client.get_collection(vs.collection_name)
        checks["qdrant"] = f"ok (points: {info.points_count})"
    except Exception as e:
        checks["qdrant"] = f"error: {str(e)}"

    all_ok = all("ok" in v for v in checks.values())
    status_code = 200 if all_ok else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if all_ok else "degraded",
            "latency_ms": round((time.time() - start) * 1000, 2),
            "checks": checks,
            "version": "1.0.0",
        }
    )
