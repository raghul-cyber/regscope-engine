import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.future import select
from app.db.models import Jurisdiction, Document
from app.crawler.seed_urls import SEED_URLS
from app.crawler.crawler import AsyncCrawler

# Use localhost connection for script
DATABASE_URL = "postgresql+asyncpg://regscope:password@localhost:5433/regscope"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

async def test_crawler():
    async with AsyncSessionLocal() as session:
        for code, urls in SEED_URLS.items():
            result = await session.execute(select(Jurisdiction).where(Jurisdiction.code == code))
            jurisdiction = result.scalar_one_or_none()
            if not jurisdiction:
                print(f"Skipping {code}, not found in DB.")
                continue
                
            seed = urls[0]
            print(f"[{code}] Starting crawl for {seed}")
            crawler = AsyncCrawler(db_session=session, jurisdiction_id=jurisdiction.id)
            await crawler.crawl(seed_url=seed, max_depth=0)
            
            # Verify DB insertion
            doc_result = await session.execute(select(Document).where(Document.url == seed))
            doc = doc_result.scalar_one_or_none()
            if doc:
                print(f"[{code}] SUCCESS: Document found in DB. Content Hash: {doc.content_hash}")
                print(f"[{code}] doc_type: {doc.doc_type}, language: {doc.language}, fetched_at: {doc.fetched_at}")
            else:
                print(f"[{code}] FAILED: Document not found in DB.")

if __name__ == "__main__":
    asyncio.run(test_crawler())
