import re
from typing import Tuple, List, Dict
import structlog

logger = structlog.get_logger(__name__)

PILLAR_6_KEYWORDS = [
    "transfer", "cross-border", "transborder", "outside the country", "third country",
    "adequacy", "comparable protection", "prescribed requirements", "standard contractual",
    "binding corporate rules", "derogation", "international transfer"
]

PILLAR_7_KEYWORDS = [
    "retention", "purpose limitation", "consent", "data subject rights", "erasure",
    "rectification", "portability", "breach notification", "data minimisation",
    "security measures", "privacy by design", "data protection officer", "processing",
    "lawful basis"
]

PATTERNS = {
    "prohibition": re.compile(r"\b(shall not|must not|no.*transfer|prohibited|forbidden)\b", re.IGNORECASE),
    "permission": re.compile(r"\b(may|permitted|allowed|authorised|lawful)\b", re.IGNORECASE),
    "condition": re.compile(r"\b(subject to|provided that|if and only if|where|unless)\b", re.IGNORECASE),
    "exception": re.compile(r"\b(except|notwithstanding|however|save where|unless)\b", re.IGNORECASE),
    "definition": re.compile(r"\b(means|refers to|is defined as|for the purposes of)\b", re.IGNORECASE),
    "obligation": re.compile(r"\b(shall|must|is required to|is obliged to)\b", re.IGNORECASE),
}

def classify_rule_based(text: str) -> Tuple[str, str, List[str]]:
    """
    Stage 1 - Fast high-precision rule based pre-filter.
    Returns (pillar, clause_type, topics)
    """
    text_lower = text.lower()
    
    # Pillar detection
    has_p6 = any(kw in text_lower for kw in PILLAR_6_KEYWORDS)
    has_p7 = any(kw in text_lower for kw in PILLAR_7_KEYWORDS)
    
    if has_p6 and has_p7:
        pillar = "both"
    elif has_p6:
        pillar = "pillar_6"
    elif has_p7:
        pillar = "pillar_7"
    else:
        pillar = "other"
        
    # Clause Type detection (first match wins for rule-based, embedding will refine)
    clause_type = "other"
    for ctype, pattern in PATTERNS.items():
        if pattern.search(text_lower):
            clause_type = ctype
            break
            
    # Topic extraction (simple keyword match)
    topics = []
    for kw in PILLAR_6_KEYWORDS + PILLAR_7_KEYWORDS:
        if kw in text_lower:
            topics.append(kw.replace(" ", "_"))
            
    return pillar, clause_type, list(set(topics))

class DualClassifier:
    def __init__(self):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self._init_anchors()
        except Exception as e:
            logger.warning("sentence_transformers_not_loaded", error=str(e))
            self.model = None

    def _init_anchors(self):
        # Anchor texts
        anchors = {
            "pillar_6": "rules governing the transfer of personal data to a foreign country or international organisation",
            "pillar_7": "domestic obligations for processing personal data including retention purpose and consent",
            "prohibition": "it is prohibited to transfer personal data outside the jurisdiction",
            "permission": "transfer of personal data is permitted subject to conditions",
            "condition": "transfer may occur provided that requirements are satisfied",
            "exception": "notwithstanding the prohibition an exception applies where",
            "obligation": "the controller shall implement measures to ensure compliance"
        }
        
        # Precompute embeddings
        texts = list(anchors.values())
        if self.model:
            embeddings = self.model.encode(texts, normalize_embeddings=True)
            self.anchor_embeddings = {k: embeddings[i] for i, k in enumerate(anchors.keys())}

    def classify(self, text: str) -> Dict:
        rule_pillar, rule_ctype, topics = classify_rule_based(text)
        
        if not self.model:
            # Fallback to rule-based if ML model fails to load
            return {
                "pillar": rule_pillar,
                "clause_type": rule_ctype,
                "topics": topics,
                "confidence": 0.8,
                "flags": ["ml_model_missing"]
            }
            
        import numpy as np
        
        # Embed target text
        target_emb = self.model.encode([text], normalize_embeddings=True)[0]
        
        # Compute similarities
        sims = {k: float(np.dot(target_emb, v)) for k, v in self.anchor_embeddings.items()}
        
        # Pillar comparison
        p6_sim = sims["pillar_6"]
        p7_sim = sims["pillar_7"]
        
        if p6_sim > 0.85 and p7_sim > 0.85:
            ml_pillar = "both"
        elif p6_sim > p7_sim and p6_sim > 0.75:
            ml_pillar = "pillar_6"
        elif p7_sim > p6_sim and p7_sim > 0.75:
            ml_pillar = "pillar_7"
        else:
            ml_pillar = "other"
            
        # Clause type comparison
        ctype_sims = {k: sims[k] for k in ["prohibition", "permission", "condition", "exception", "obligation"]}
        ml_ctype = max(ctype_sims.items(), key=lambda x: x[1])
        
        confidence = ml_ctype[1]
        final_ctype = ml_ctype[0]
        
        flags = []
        if confidence < 0.55:
            flags.append("low_confidence")
            final_ctype = "other"
            
        if rule_ctype != "other" and ml_ctype[0] != rule_ctype:
            flags.append("ambiguous")
            # Keep embedding result per requirements
            
        return {
            "pillar": ml_pillar,
            "clause_type": final_ctype,
            "topics": topics,
            "confidence": confidence,
            "flags": flags
        }
