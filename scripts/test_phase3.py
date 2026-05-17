import asyncio
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.future import select
from app.db.models import Document, Clause, Citation, Conflict
from app.pipeline.processor import process_document

# Use localhost connection for script
DATABASE_URL = "postgresql+asyncpg://regscope:password@localhost:5433/regscope"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

async def test_pipeline():
    async with AsyncSessionLocal() as session:
        # Fetch up to 3 documents we crawled in Phase 2
        result = await session.execute(select(Document).limit(3))
        docs = result.scalars().all()
        
        if not docs:
            print("No documents found. Please run test_phase2.py first.")
            return
            
        print(f"Found {len(docs)} documents. Running pipeline...")
        
        doc_ids = [doc.id for doc in docs]
        
        for doc_id in doc_ids:
            print(f"Processing Document {doc_id}...")
            await process_document(session, str(doc_id))
            
        # Verify DB population
        print("\n--- DB VERIFICATION ---")
        for doc_id in doc_ids:
            clauses_res = await session.execute(select(Clause).where(Clause.document_id == doc_id))
            clauses = clauses_res.scalars().all()
            
            citations_res = await session.execute(select(Citation).where(Citation.source_doc_id == doc_id))
            citations = citations_res.scalars().all()
            
            conflicts_res = await session.execute(select(Conflict))
            conflicts = conflicts_res.scalars().all()
            
            print(f"Doc {doc_id}: {len(clauses)} clauses, {len(citations)} citations")
            
            if clauses:
                sample = clauses[0]
                print(f"  Sample Clause [Type: {sample.clause_type}, Pillar: {sample.pillar}]:")
                print(f"  > {sample.raw_text[:150]}...")
                if sample.flags:
                    print(f"  Flags: {sample.flags}")
                    
        print(f"\nTotal Conflicts detected globally: {len(conflicts)}")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
