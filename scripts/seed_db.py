import asyncio
import os
import sys

# Add backend to path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.future import select
from app.db.models import Jurisdiction
from app.crawler.seed_urls import SEED_URLS
import uuid

# Use localhost connection for script
DATABASE_URL = "postgresql+asyncpg://regscope:password@localhost:5433/regscope"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

async def seed_jurisdictions():
    async with AsyncSessionLocal() as session:
        for code, urls in SEED_URLS.items():
            name = {
                "IN": "India",
                "SG": "Singapore",
                "EU": "European Union"
            }.get(code, code)
            
            # Check if exists
            result = await session.execute(select(Jurisdiction).where(Jurisdiction.code == code))
            existing = result.scalar_one_or_none()
            if not existing:
                j = Jurisdiction(id=uuid.uuid4(), name=name, code=code)
                session.add(j)
                print(f"Added Jurisdiction: {name} ({code})")
        
        await session.commit()
        print("Jurisdiction seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_jurisdictions())
