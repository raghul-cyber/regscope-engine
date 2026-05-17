from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://regscope:password@localhost:5432/regscope"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION: str = "regscope_clauses"
    
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-large"
    
    CRAWLER_MAX_DEPTH: int = 3
    CRAWLER_REQUEST_DELAY_SECONDS: float = 1.5
    CRAWLER_MAX_PAGES_PER_DOMAIN: int = 200
    
    OCR_CONFIDENCE_THRESHOLD: float = 0.75
    OCR_PRIMARY_ENGINE: str = "easyocr"
    
    CLASSIFIER_CONFIDENCE_THRESHOLD: float = 0.55
    VERIFIER_STRICT_MODE: bool = True
    
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 7860
    CORS_ORIGINS: str = "http://localhost:3000,https://regscope.yourdomain.com"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
