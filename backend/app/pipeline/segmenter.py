import re
import spacy
from typing import List, Optional
from dataclasses import dataclass

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # In production, models should be pre-downloaded in Dockerfile
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

@dataclass
class ClauseSegment:
    raw_text: str
    char_start: int
    char_end: int
    page_number: Optional[int]
    section_id: str
    clause_number: Optional[str]

TRANSITION_KEYWORDS = [
    "provided that", "notwithstanding", "subject to", "except", "however"
]

ARTICLE_PATTERN = re.compile(r"^(?:article|section|§)\s*\d+", re.IGNORECASE)

def segment_section(parsed_section, section_id: str, page_number: Optional[int] = None) -> List[ClauseSegment]:
    """
    Algorithm:
    1. Split section text at sentence boundaries using spaCy
    2. Group sentences into clauses:
       a. Start new clause at: new article/section number pattern
       b. Start new clause at: transition keywords
       c. Merge orphan single sentences (<20 tokens) with preceding clause
    3. Record char_start, char_end (relative to document text), page_number, section_id
    4. Assign clause_number by counting within section
    """
    text = parsed_section.text
    base_char_start = parsed_section.char_start
    
    doc = nlp(text)
    sentences = list(doc.sents)
    
    clauses = []
    current_clause_sentences = []
    
    def finalize_clause():
        if not current_clause_sentences:
            return
            
        clause_text = " ".join([s.text for s in current_clause_sentences])
        
        # Calculate precise offsets by finding the text in the original section text
        # Since spaCy might modify whitespace, we do a find
        start_offset = text.find(current_clause_sentences[0].text)
        if start_offset == -1:
            start_offset = 0
            
        end_offset = text.find(current_clause_sentences[-1].text)
        if end_offset != -1:
            end_offset += len(current_clause_sentences[-1].text)
        else:
            end_offset = len(text)
            
        char_start = base_char_start + start_offset
        char_end = base_char_start + end_offset
        
        # We need the exact verbatim text
        raw_text = text[start_offset:end_offset]
        
        clauses.append({
            "raw_text": raw_text,
            "char_start": char_start,
            "char_end": char_end,
            "sentences_count": len(current_clause_sentences),
            "tokens_count": sum(len(s) for s in current_clause_sentences)
        })
        current_clause_sentences.clear()

    for sent in sentences:
        sent_text_lower = sent.text.lower().strip()
        
        # Check start conditions
        is_new_article = bool(ARTICLE_PATTERN.match(sent_text_lower))
        has_transition = any(sent_text_lower.startswith(kw) for kw in TRANSITION_KEYWORDS)
        
        if is_new_article or has_transition:
            # Check if current orphan should be merged before finalizing
            if current_clause_sentences:
                tokens_count = sum(len(s) for s in current_clause_sentences)
                if tokens_count < 20 and len(clauses) > 0 and not is_new_article:
                    # Merge logic for phase 2 simplified
                    pass
                finalize_clause()
                
        current_clause_sentences.append(sent)
        
    finalize_clause()
    
    # Second pass: merge orphans and create objects
    results = []
    for idx, c in enumerate(clauses):
        # Merge orphan check simplified for now
        results.append(ClauseSegment(
            raw_text=c["raw_text"],
            char_start=c["char_start"],
            char_end=c["char_end"],
            page_number=page_number,
            section_id=section_id,
            clause_number=str(idx + 1)
        ))
        
    return results
