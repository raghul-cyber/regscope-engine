#!/bin/bash
DOMAIN=${1:-regscope.yourdomain.com}
SLACK_WEBHOOK=${SLACK_WEBHOOK_URL:-""}

response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN/health")

if [ "$response" != "200" ]; then
    echo "ALERT: RegScope health check failed! HTTP $response"
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"🚨 RegScope health check failed! HTTP $response at $(date)\"}"
    fi
    exit 1
fi

echo "OK: RegScope healthy (HTTP $response)"
