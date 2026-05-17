#!/bin/bash
# Cron: 0 2 * * * /opt/regscope/scripts/backup_db.sh

set -euo pipefail
BACKUP_DIR=/opt/regscope/backups
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Load env
source /opt/regscope/.env

echo "Starting backup at $DATE..."

# PostgreSQL dump
docker compose -f /opt/regscope/infra/docker-compose.prod.yml exec -T postgres \
    pg_dump -U $POSTGRES_USER $POSTGRES_DB | \
    gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# Qdrant snapshot
curl -X POST "http://localhost:6333/collections/regscope_clauses/snapshots" \
    -H "api-key: $QDRANT_API_KEY" | \
    python3 -c "import sys,json; print(json.load(sys.stdin)['result']['name'])" | \
    xargs -I{} curl -o "$BACKUP_DIR/qdrant_$DATE.snapshot" \
        "http://localhost:6333/collections/regscope_clauses/snapshots/{}"

# Remove backups older than retention period
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.snapshot" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: $BACKUP_DIR/postgres_$DATE.sql.gz"
echo "Qdrant snapshot: $BACKUP_DIR/qdrant_$DATE.snapshot"

# Optional: upload to S3
# aws s3 cp "$BACKUP_DIR/postgres_$DATE.sql.gz" "s3://your-bucket/regscope-backups/"
