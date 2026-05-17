import hashlib
import unicodedata
from typing import Tuple
from langdetect import detect, DetectorFactory
from langdetect.lang_detect_exception import LangDetectException

# To ensure consistent language detection
DetectorFactory.seed = 0

def normalize_text(raw_bytes: bytes) -> Tuple[str, str]:
    """
    Decodes bytes to string, normalizes unicode (NFC),
    and strips control characters.
    Returns (normalized_text, encoding).
    """
    # Simple decode strategy
    encodings = ["utf-8", "windows-1252", "latin-1"]
    text = ""
    used_encoding = "utf-8"
    for enc in encodings:
        try:
            text = raw_bytes.decode(enc)
            used_encoding = enc
            break
        except UnicodeDecodeError:
            continue
            
    # Normalize unicode
    text = unicodedata.normalize("NFC", text)
    # Strip basic control chars except newlines/tabs
    text = "".join(ch for ch in text if unicodedata.category(ch)[0] != "C" or ch in ("\n", "\r", "\t"))
    return text, used_encoding

def compute_hash(content: bytes) -> str:
    """Compute SHA-256 hash of raw content bytes for immutability proof."""
    return hashlib.sha256(content).hexdigest()

def detect_language(text: str) -> str:
    """
    Detect language using langdetect. Returns ISO 639-1 code.
    Defaults to 'en' if detection fails.
    """
    try:
        if not text.strip():
            return "en"
        return detect(text)
    except LangDetectException:
        return "en"
