from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title="RegScope Engine",
    description="Automated Cross-Border Data Compliance Intelligence",
    version="0.1.0"
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "RegScope Engine API is running."}

