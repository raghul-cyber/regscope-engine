# RegScope Engine

Automated Cross-Border Data Compliance Intelligence

## Overview
RegScope Engine is a compliance intelligence platform designed to extract, classify, cite, and verify regulatory clauses from official government sources across jurisdictions.

## Architecture
```
[ Crawler ] -> [ Ingestion (HTML/PDF/OCR) ] -> [ Pipeline (Segment/Classify/Link) ] -> [ DB/Vector Store ]
                                                                                               |
[ Next.js Frontend ] <---------------- [ FastAPI Backend ] <-----------------------------------+
```

## Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node 20+

## Local Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Start the infrastructure (PostgreSQL, Redis, Qdrant):
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   ```
3. Run Alembic migrations to set up the database (requires Docker infrastructure running):
   ```bash
   cd backend
   alembic upgrade head
   ```

## Development
- Frontend is located in `frontend/` (Next.js)
- Backend is located in `backend/` (FastAPI)
- Task Monitor (Flower) available at `http://localhost:5555`

## API Docs
Once the backend is running, visit `http://localhost:8000/docs`.
