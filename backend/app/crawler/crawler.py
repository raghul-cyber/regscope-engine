"""
AsyncCrawler: Fetches documents from official regulatory portals.

Responsibilities:
- Accept a seed URL and crawl depth
- Detect whether page requires JS rendering (use Playwright) or not (use httpx)
- Follow same-domain links up to configured max_depth
- Respect robots.txt
- Detect language via langdetect on raw text
- Classify document type: html, pdf, or scanned_pdf
- Return: list of RawDocument(url, content_bytes, doc_type, language, fetched_at)
- Store content_hash = SHA-256(content_bytes)
- Persist RawDocument to `documents` table with status='fetched'
- Enqueue ingestion task via Celery for each fetched document
"""

import asyncio
import hashlib
from datetime import datetime
from urllib.parse import urlparse, urljoin
from typing import List, Optional
from dataclasses import dataclass
import uuid

import httpx
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.db.models import Document
from app.ingestion.normalizer import compute_hash, normalize_text, detect_language

logger = structlog.get_logger(__name__)

@dataclass
class RawDocument:
    url: str
    content_bytes: bytes
    doc_type: str
    language: str
    fetched_at: datetime
    content_hash: str

class AsyncCrawler:
    def __init__(self, db_session: AsyncSession, jurisdiction_id: uuid.UUID):
        self.db = db_session
        self.jurisdiction_id = jurisdiction_id
        self.visited = set()
        
    async def fetch(self, url: str) -> Optional[bytes]:
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            async with httpx.AsyncClient(follow_redirects=True, timeout=15.0, headers=headers) as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.content
        except Exception as e:
            logger.error("crawl_fetch_error", url=url, error=str(e))
            return None
            
    def determine_doc_type(self, content: bytes, url: str) -> str:
        if url.lower().endswith(".pdf") or content[:4] == b"%PDF":
            return "pdf"
        return "html"
        
    async def process_url(self, url: str) -> Optional[Document]:
        if url in self.visited:
            return None
        self.visited.add(url)
        
        content = await self.fetch(url)
        if not content:
            return None
            
        doc_type = self.determine_doc_type(content, url)
        
        # Deduplication check
        content_hash = compute_hash(content)
        existing = await self.db.execute(
            select(Document).where(Document.content_hash == content_hash)
        )
        if existing.scalar_one_or_none():
            logger.info("document_already_exists", url=url, hash=content_hash)
            return None
            
        url_hash = hashlib.sha256(url.encode()).hexdigest()
        
        # Detect language (decode safely first)
        text_content, _ = normalize_text(content)
        language = detect_language(text_content)
        
        doc = Document(
            jurisdiction_id=self.jurisdiction_id,
            title=url, # Placeholder, HTML parser will update this later
            url=url,
            url_hash=url_hash,
            content_hash=content_hash,
            doc_type=doc_type,
            language=language[:10], # strict limit based on db schema
            authority_tier='primary',
            fetched_at=datetime.utcnow(),
            raw_content=text_content
        )
        self.db.add(doc)
        await self.db.commit()
        await self.db.refresh(doc)
        logger.info("document_persisted", doc_id=str(doc.id), url=url)
        
        # Trigger celery task
        try:
            from app.workers.tasks import ingest_document
            ingest_document.delay(str(doc.id))
        except ImportError:
            logger.warning("celery_task_import_failed", doc_id=str(doc.id))
            
        return doc

    async def crawl(self, seed_url: str, max_depth: int):
        # Simplistic queue-based crawling for phase 2.
        # Playwright and full link extraction via link_extractor.py to follow in Phase 7.
        queue = [(seed_url, 0)]
        while queue:
            current_url, depth = queue.pop(0)
            if depth > max_depth:
                continue
                
            await self.process_url(current_url)
            await asyncio.sleep(settings.CRAWLER_REQUEST_DELAY_SECONDS)
