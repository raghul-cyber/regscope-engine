from typing import List, Dict, Any
import structlog

logger = structlog.get_logger(__name__)

class OCREngine:
    def __init__(self):
        self.reader = None
        self.legal_dict = [
            "adequacy", "prohibition", "controller", "processor",
            "data subject", "cross-border", "transfer", "consent", "retention"
        ]
        try:
            import easyocr
            # We don't download models here to avoid disk crash during initialization
            # self.reader = easyocr.Reader(['en'])
        except Exception as e:
            logger.warning("easyocr_not_initialized", error=str(e))

    def extract_text(self, page_image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Mock implementation for Phase 4 to avoid disk crash, 
        but structured for real EasyOCR output.
        """
        if self.reader:
            # results = self.reader.readtext(page_image_bytes)
            # return [{"text": r[1], "conf": r[2], "bbox": r[0]} for r in results]
            pass
            
        return [{
            "text": "Extracted Mock Legal Text regarding data transfer.",
            "confidence": 0.95,
            "bounding_box": [0, 0, 100, 100],
            "page_number": 1
        }]
