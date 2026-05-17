from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from io import BytesIO

from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer, LTChar

@dataclass
class ParsedPage:
    page_number: int
    text: str
    bounding_boxes: List[Dict[str, Any]] # per char or word

def extract_pdf(pdf_bytes: bytes) -> List[ParsedPage]:
    """
    - Use pdfminer.six LAParams for layout-aware extraction
    - For each page: extract text with character-level bounding boxes
    - Detect scanned PDF: if text_layer_char_count / page_count < 50, flag as scanned
    - Produce: List[ParsedPage] with page_number, text, bounding_boxes per char
    """
    parsed_pages = []
    
    # Simplified extraction for Phase 2
    try:
        for page_layout in extract_pages(BytesIO(pdf_bytes)):
            page_num = page_layout.pageid
            page_text = ""
            bboxes = []
            
            for element in page_layout:
                if isinstance(element, LTTextContainer):
                    for text_line in element:
                        for character in text_line:
                            if isinstance(character, LTChar):
                                text = character.get_text()
                                page_text += text
                                bboxes.append({
                                    "char": text,
                                    "bbox": character.bbox # (x0, y0, x1, y1)
                                })
                                
            parsed_pages.append(ParsedPage(
                page_number=page_num,
                text=page_text,
                bounding_boxes=bboxes
            ))
    except Exception:
        # Fallback for errors or empty
        pass
        
    return parsed_pages

def is_scanned_pdf(parsed_pages: List[ParsedPage]) -> bool:
    if not parsed_pages:
        return True
    
    total_chars = sum(len(page.text) for page in parsed_pages)
    if total_chars / len(parsed_pages) < 50:
        return True
    return False
