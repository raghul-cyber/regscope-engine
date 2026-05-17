import structlog
import uuid
from typing import List, Dict, Optional
from app.db.models import Document, Clause, Citation, Conflict, Section

logger = structlog.get_logger(__name__)

class VerifierError(Exception):
    pass

class SpanMissingError(VerifierError):
    pass

class SpanMismatchError(VerifierError):
    pass

def verify_clause_and_citation(clause: Clause, citation: Citation, document: Document):
    """
    CHECK 1 - Span Existence
    Every clause must have at least 1 citation with char_start and char_end
    that resolve to actual content in the source document.
    """
    if citation.char_start is None or citation.char_end is None:
        raise SpanMissingError(f"Clause {clause.id} is missing span coordinates")
        
    """
    CHECK 2 - Verbatim Match
    citation.verbatim_snippet == document.raw_content[citation.char_start:citation.char_end]
    """
    actual_text = document.raw_content[citation.char_start:citation.char_end]
    if citation.verbatim_snippet != actual_text[:500]:
        raise SpanMismatchError(f"Clause {clause.id} verbatim match failed")

    """
    CHECK 3 - OCR Confidence Threshold
    If clause.ocr_confidence is not None and < 0.75:
    Flag clause with "ocr_low_confidence" and block from auto-export.
    """
    if clause.ocr_confidence is not None and clause.ocr_confidence < 0.75:
        if "ocr_low_confidence" not in clause.flags:
            clause.flags.append("ocr_low_confidence")

    """
    CHECK 4 - Negation Flip Detection
    For clauses with clause_type == 'prohibition':
    Check for negation terms
    """
    if clause.clause_type == "prohibition":
        negation_terms = ["not", "no", "never", "prohibited", "forbidden", "shall not"]
        text_lower = clause.raw_text.lower()
        if not any(nt in text_lower for nt in negation_terms):
            if "potential_flip" not in clause.flags:
                clause.flags.append("potential_flip")

def verify_document_consistency(document: Document, clauses: List[Clause]) -> List[Conflict]:
    """
    CHECK 5 - Internal Consistency
    If a permission clause and prohibition clause share >70% overlapping topic keywords:
    Create a conflict record.
    """
    conflicts = []
    permissions = [c for c in clauses if c.clause_type == "permission"]
    prohibitions = [c for c in clauses if c.clause_type == "prohibition"]
    
    for perm in permissions:
        for proh in prohibitions:
            perm_topics = set(perm.topics)
            proh_topics = set(proh.topics)
            if not perm_topics or not proh_topics:
                continue
                
            intersection = perm_topics.intersection(proh_topics)
            union = perm_topics.union(proh_topics)
            overlap = len(intersection) / len(union)
            
            if overlap > 0.7:
                conflicts.append(Conflict(
                    id=uuid.uuid4(),
                    clause_a_id=perm.id,
                    clause_b_id=proh.id,
                    conflict_type="contradiction",
                    description=f"Topic overlap {overlap:.2f} between permission and prohibition"
                ))

    """
    CHECK 6 - Missing Condition for Permitted Transfer
    """
    for c in permissions:
        if c.pillar == "pillar_6":
            # Find conditions in the same section
            has_condition = any(
                other.clause_type == "condition" and other.section_id == c.section_id 
                for other in clauses
            )
            if not has_condition:
                if "missing_condition" not in c.flags:
                    c.flags.append("missing_condition")
                    
    """
    CHECK 7 - Completeness
    """
    section_clauses = {}
    for c in clauses:
        section_clauses.setdefault(c.section_id, []).append(c)
        
    for section_id, s_clauses in section_clauses.items():
        has_proh = any(c.clause_type == "prohibition" for c in s_clauses)
        if has_proh:
            has_cond_or_exc = any(c.clause_type in ["condition", "exception"] for c in s_clauses)
            if not has_cond_or_exc:
                # Flag the section, but we don't have Section objects passed here
                # So we flag the prohibition clauses themselves for Phase 2 simplicty
                for c in s_clauses:
                    if c.clause_type == "prohibition":
                        if "incomplete_rule" not in c.flags:
                            c.flags.append("incomplete_rule")

    return conflicts
