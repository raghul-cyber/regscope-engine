#!/usr/bin/env python3
"""Generate all secrets for production deployment and create .env.prod."""
import secrets
import string
import os

def generate_password(length=32):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def main():
    postgres_pass = generate_password(24)
    redis_pass = generate_password(24)
    qdrant_key = generate_password(32)
    secret_key = secrets.token_hex(32)
    flower_pass = generate_password(16)

    env_content = f"""# ── Application ───────────────────────────────────────────────
ENVIRONMENT=production
SECRET_KEY={secret_key}
DEBUG=false

# ── Database ──────────────────────────────────────────────────
POSTGRES_DB=regscope
POSTGRES_USER=regscope
POSTGRES_PASSWORD={postgres_pass}
DATABASE_URL=postgresql+asyncpg://regscope:{postgres_pass}@postgres:5432/regscope

# ── Redis ─────────────────────────────────────────────────────
REDIS_PASSWORD={redis_pass}
REDIS_URL=redis://:{redis_pass}@redis:6379/0

# ── Qdrant ────────────────────────────────────────────────────
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_API_KEY={qdrant_key}
QDRANT_COLLECTION=regscope_clauses

# ── Embedding ─────────────────────────────────────────────────
EMBEDDING_MODEL=intfloat/multilingual-e5-large

# ── Crawler ───────────────────────────────────────────────────
CRAWLER_MAX_DEPTH=3
CRAWLER_REQUEST_DELAY_SECONDS=2.0
CRAWLER_MAX_PAGES_PER_DOMAIN=200

# ── OCR ───────────────────────────────────────────────────────
OCR_CONFIDENCE_THRESHOLD=0.75
OCR_PRIMARY_ENGINE=easyocr

# ── Pipeline ──────────────────────────────────────────────────
CLASSIFIER_CONFIDENCE_THRESHOLD=0.55
VERIFIER_STRICT_MODE=true

# ── API ───────────────────────────────────────────────────────
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=https://regscope.yourdomain.com

# ── Frontend ──────────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=https://regscope.yourdomain.com/api/v1

# ── Docker Registry ───────────────────────────────────────────
REGISTRY=ghcr.io/yourusername
IMAGE_TAG=latest

# ── Flower ────────────────────────────────────────────────────
FLOWER_USER=admin
FLOWER_PASSWORD={flower_pass}

# ── Monitoring ────────────────────────────────────────────────
SENTRY_DSN=
PROMETHEUS_ENABLED=true

# ── Domain ────────────────────────────────────────────────────
DOMAIN=regscope.yourdomain.com
"""
    out_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.prod")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print(f"Successfully generated full {out_path}")

if __name__ == "__main__":
    main()
