import asyncio
import uuid
import structlog
from datetime import datetime
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Document, Section, Clause, Citation, ClauseEmbedding, Conflict
from app.ingestion.html_parser import parse_html
from app.ingestion.pdf_extractor import extract_pdf
from app.pipeline.segmenter import segment_section
from app.pipeline.classifier import DualClassifier
from app.pipeline.embedder import ClauseEmbedder
from app.pipeline.span_linker import build_citation
from app.pipeline.verifier import verify_clause_and_citation, verify_document_consistency

logger = structlog.get_logger(__name__)

# Initialize ML models globally (lazy loading inside classes handles errors)
classifier = DualClassifier()
embedder = ClauseEmbedder()

async def process_document(db: AsyncSession, document_id: str):
    logger.info("pipeline_started", document_id=document_id)
    
    # 1. Fetch document
    doc_result = await db.execute(select(Document).where(Document.id == uuid.UUID(document_id)))
    document = doc_result.scalar_one_or_none()
    
    if not document:
        logger.error("document_not_found", document_id=document_id)
        return
        
    # 2. Parse HTML / PDF into sections
    if document.doc_type == "html":
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(document.raw_content, "html.parser")
        plain_text = soup.get_text(separator="\n", strip=True)
        # Update raw_content in memory so SpanLinker sees the cleaned text
        document.raw_content = plain_text
        
        from app.ingestion.html_parser import ParsedSection
        # Create a single section for the whole document to simplify offsets
        parsed_sections = [
            ParsedSection(
                heading="Main Content",
                text=plain_text,
                level=1,
                char_start=0,
                char_end=len(plain_text),
                xpath="/html/body"
            )
        ]
    else:
        # Simplified for PDF in Phase 2/3
        logger.warning("pdf_parsing_skipped_in_phase3_test", document_id=document_id)
        parsed_sections = []

    db_sections = []
    for ps in parsed_sections:
        sec = Section(
            id=uuid.uuid4(),
            document_id=document.id,
            heading=ps.heading,
            section_number=ps.heading, # Approximation for now
            level=ps.level,
            char_start=ps.char_start,
            char_end=ps.char_end
        )
        db_sections.append(sec)
        db.add(sec)
        
    # Sections are added to session but not committed yet to avoid expire issues


    all_clauses: List[Clause] = []
    all_citations: List[Citation] = []
    all_embeddings: List[ClauseEmbedding] = []
    
    # 3. Segment & Classify & Link
    for ps, sec in zip(parsed_sections, db_sections):
        segments = segment_section(ps, str(sec.id), page_number=None)
        
        for seg in segments:
            # Classification
            class_res = classifier.classify(seg.raw_text)
            
            clause = Clause(
                id=uuid.uuid4(),
                document_id=document.id,
                section_id=sec.id,
                raw_text=seg.raw_text,
                clause_number=seg.clause_number,
                pillar=class_res["pillar"],
                clause_type=class_res["clause_type"],
                topics=class_res["topics"],
                confidence=class_res["confidence"],
                flags=class_res["flags"],
                char_start=seg.char_start,
                char_end=seg.char_end,
                page_number=seg.page_number,
                created_at=datetime.utcnow()
            )
            
            # Embedding
            emb = embedder.embed_clause(clause.id, clause.raw_text)
            if emb:
                all_embeddings.append(emb)
                
            # Span Linker
            try:
                citation = build_citation(clause, document, sec)
            except Exception as e:
                logger.error("span_linker_failed", clause_id=str(clause.id), error=str(e))
                continue
                
            # Verification Checks 1-4
            try:
                verify_clause_and_citation(clause, citation, document)
            except Exception as e:
                logger.error("verifier_check_failed", clause_id=str(clause.id), error=str(e))
                continue
                
            all_clauses.append(clause)
            all_citations.append(citation)

    # Verification Checks 5-7
    conflicts = verify_document_consistency(document, all_clauses)
    
    # Write transactions
    try:
        # Sections added earlier
        await db.flush()
        
        db.add_all(all_clauses)
        await db.flush()
        
        db.add_all(all_citations)
        db.add_all(all_embeddings)
        db.add_all(conflicts)
        await db.commit()
        
        # Sync to Vector Store (Qdrant)
        if all_embeddings:
            from app.db.vector_store import VectorStore
            vs = VectorStore()
            vs.upsert_clauses(
                clause_ids=[e.clause_id for e in all_embeddings],
                vectors=[e.vector for e in all_embeddings],
                payloads=[{
                    "document_id": str(document.id),
                    "pillar": c.pillar,
                    "clause_type": c.clause_type,
                    "jurisdiction": str(document.jurisdiction_id)
                } for c in all_clauses for e in all_embeddings if e.clause_id == c.id]
            )
            logger.info("vector_store_synced", count=len(all_embeddings))
        logger.info("pipeline_completed", 
                    document_id=document_id, 
                    clauses=len(all_clauses),
                    citations=len(all_citations),
                    conflicts=len(conflicts))
    except Exception as e:
        await db.rollback()
        logger.error("pipeline_commit_failed", document_id=document_id, error=str(e))
