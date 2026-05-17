from pydantic import BaseModel, UUID4, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class CrawlRequest(BaseModel):
    jurisdiction_code: str
    depth: int = 2
    force_recrawl: bool = False

class CrawlResponse(BaseModel):
    job_id: UUID4
    status: str
    message: str

class JobStatusResponse(BaseModel):
    job_id: UUID4
    status: str
    documents_found: int
    progress: float

class DocumentSummary(BaseModel):
    id: UUID4
    title: str
    jurisdiction_id: UUID4
    doc_type: str
    authority_tier: str
    effective_date: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

class PaginatedDocuments(BaseModel):
    items: List[DocumentSummary]
    total: int
    page: int
    page_size: int

class CitationSchema(BaseModel):
    id: UUID4
    article: Optional[str]
    section_ref: Optional[str]
    page_number: Optional[int]
    verbatim_snippet: str
    source_url: Optional[str] = None
    content_hash: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ClauseWithCitations(BaseModel):
    id: UUID4
    raw_text: str
    pillar: str
    clause_type: str
    topics: List[str]
    confidence: float
    flags: List[str]
    citations: List[CitationSchema]
    model_config = ConfigDict(from_attributes=True)

class ClauseDetailResponse(ClauseWithCitations):
    section: dict
    document: dict

class PaginatedClauses(BaseModel):
    items: List[ClauseWithCitations]
    total: int
    page: int
    page_size: int

class SearchRequest(BaseModel):
    query: str
    jurisdictions: Optional[List[str]] = None
    pillars: Optional[List[str]] = None
    top_k: int = 20

class SearchResultItem(BaseModel):
    clause: ClauseWithCitations
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResultItem]

class AuditResponse(BaseModel):
    clause: ClauseWithCitations
    source_document: dict
    span_verification: dict
    surrounding_context: str
    page_image_url: Optional[str]

class ConflictResolutionRequest(BaseModel):
    resolution_note: str

class ConflictRecord(BaseModel):
    id: UUID4
    clause_a_id: UUID4
    clause_b_id: UUID4
    conflict_type: str
    description: str
    resolved: bool
    resolution_note: Optional[str]
    detected_at: datetime
    model_config = ConfigDict(from_attributes=True)
