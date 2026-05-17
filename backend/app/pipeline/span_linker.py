import uuid
import structlog
from typing import Optional
from app.db.models import Clause, Citation, Document, Section

logger = structlog.get_logger(__name__)

class SpanIntegrityError(Exception):
    pass

def build_citation(clause: Clause, source_doc: Document, parent_section: Section) -> Citation:
    """
    1. Record verbatim_snippet = clause.raw_text[:500] (never paraphrase)
    2. Build Citation object
    3. Validate: assert verbatim_snippet == source_doc.raw_content[char_start:char_end]
    """
    verbatim_snippet = clause.raw_text[:500]
    
    # We should search parent sections for 'Article'
    article_ref = None
    if parent_section.section_number and "article" in parent_section.section_number.lower():
        article_ref = parent_section.section_number
        
    citation = Citation(
        id=uuid.uuid4(),
        clause_id=clause.id,
        source_doc_id=source_doc.id,
        article=article_ref,
        section_ref=parent_section.section_number,
        page_number=clause.page_number,
        char_start=clause.char_start,
        char_end=clause.char_end,
        verbatim_snippet=verbatim_snippet,
        citation_role="primary"
    )
    
    # Validation step to ensure no generation/hallucination occurred
    actual_text = source_doc.raw_content[clause.char_start:clause.char_end]
    if verbatim_snippet != actual_text[:500]:
        logger.error("span_integrity_failed", 
                     clause_id=str(clause.id), 
                     expected=verbatim_snippet, 
                     actual=actual_text[:500])
        raise SpanIntegrityError("Span integrity check failed. Clause text does not match source document exactly.")
        
    return citation
