#!/bin/bash
# Run on the production server to do first-time deploy
set -euo pipefail

APP_DIR=/opt/regscope
DOMAIN=${DOMAIN:-regscope.yourdomain.com}
EMAIL=${EMAIL:-admin@yourdomain.com}  # For Let's Encrypt

echo "=== RegScope Production Deploy ==="

# Clone repository
cd /opt
if [ ! -d regscope ]; then
    git clone https://github.com/yourusername/regscope.git
fi
cd regscope

# Copy environment file (you must have uploaded .env.prod first)
if [ ! -f .env ]; then
    echo "ERROR: .env file missing. Upload your .env.prod as .env first."
    exit 1
fi

# Login to GitHub Container Registry
echo "Logging into container registry..."
cat .env | grep GITHUB_TOKEN | cut -d= -f2 | \
    docker login ghcr.io -u yourusername --password-stdin

# Pull all images
echo "Pulling images..."
docker compose -f infra/docker-compose.prod.yml pull

# Start data layer first
echo "Starting data services..."
docker compose -f infra/docker-compose.prod.yml up -d postgres redis qdrant
echo "Waiting 30s for data services to be healthy..."
sleep 30

# Run database migrations
echo "Running migrations..."
docker compose -f infra/docker-compose.prod.yml run --rm backend alembic upgrade head

# Seed database with jurisdiction data
echo "Seeding database..."
docker compose -f infra/docker-compose.prod.yml run --rm backend python scripts/seed_db.py

# Initialize Qdrant collection
echo "Initializing vector store..."
docker compose -f infra/docker-compose.prod.yml run --rm backend python -c "
from app.search.vector_store import VectorStore
import asyncio
asyncio.run(VectorStore().initialize_collection())
print('Qdrant collection initialized')
"

# Obtain SSL certificate (first time)
echo "Obtaining SSL certificate..."
docker compose -f infra/docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Start all services
echo "Starting all services..."
docker compose -f infra/docker-compose.prod.yml up -d

# Wait and run health check
echo "Waiting 60s for all services to start..."
sleep 60

python scripts/health_check.py --mode production --host $DOMAIN

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: https://$DOMAIN"
echo "API Docs: https://$DOMAIN/docs (restricted)"
echo "Flower:   https://$DOMAIN/flower/ (restricted)"
echo ""
echo "Next steps:"
echo "  1. Trigger first crawl: POST https://$DOMAIN/api/v1/crawl"
echo "  2. Monitor workers: https://$DOMAIN/flower/"
echo "  3. View dashboard: https://$DOMAIN"
