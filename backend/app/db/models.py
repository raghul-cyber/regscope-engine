import uuid
from datetime import datetime
from typing import List, Optional, Any

from sqlalchemy import String, Integer, Float, Boolean, Text, ForeignKey, Enum, JSON, Date, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from pgvector.sqlalchemy import Vector

class Base(DeclarativeBase):
    pass

class Jurisdiction(Base):
    __tablename__ = "jurisdictions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100))
    code: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jurisdiction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("jurisdictions.id"))
    title: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(Text, unique=True)
    url_hash: Mapped[str] = mapped_column(String(64))
    content_hash: Mapped[str] = mapped_column(String(64))
    doc_type: Mapped[str] = mapped_column(Enum('html', 'pdf', 'scanned_pdf', name='doc_type_enum'))
    language: Mapped[str] = mapped_column(String(10))
    authority_tier: Mapped[str] = mapped_column(Enum('primary', 'secondary', 'guidance', name='authority_tier_enum'))
    effective_date: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    raw_content: Mapped[str] = mapped_column(Text)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    metadata_: Mapped[Optional[dict]] = mapped_column(JSONB, name="metadata", nullable=True)

class Section(Base):
    __tablename__ = "sections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"))
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("sections.id"), nullable=True)
    heading: Mapped[str] = mapped_column(Text)
    section_number: Mapped[str] = mapped_column(String(50))
    level: Mapped[int] = mapped_column(Integer)
    page_start: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    page_end: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    char_start: Mapped[int] = mapped_column(Integer)
    char_end: Mapped[int] = mapped_column(Integer)

class Clause(Base):
    __tablename__ = "clauses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"))
    section_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sections.id"))
    raw_text: Mapped[str] = mapped_column(Text)
    clause_number: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    pillar: Mapped[str] = mapped_column(Enum('pillar_6', 'pillar_7', 'both', 'other', name='pillar_enum'))
    clause_type: Mapped[str] = mapped_column(Enum('prohibition', 'permission', 'condition', 'exception', 'definition', 'obligation', 'other', name='clause_type_enum'))
    topics: Mapped[List[str]] = mapped_column(ARRAY(Text))
    confidence: Mapped[float] = mapped_column(Float)
    ocr_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    flags: Mapped[List[str]] = mapped_column(ARRAY(Text))
    char_start: Mapped[int] = mapped_column(Integer)
    char_end: Mapped[int] = mapped_column(Integer)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    bounding_box: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    xpath: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ClauseEmbedding(Base):
    __tablename__ = "clause_embeddings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clause_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clauses.id"))
    vector: Mapped[Any] = mapped_column(Vector(1024))
    model_name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Citation(Base):
    __tablename__ = "citations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clause_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clauses.id"))
    source_doc_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("documents.id"))
    article: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    section_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    char_start: Mapped[int] = mapped_column(Integer)
    char_end: Mapped[int] = mapped_column(Integer)
    verbatim_snippet: Mapped[str] = mapped_column(Text)
    citation_role: Mapped[str] = mapped_column(Enum('primary', 'supporting', name='citation_role_enum'))

class Conflict(Base):
    __tablename__ = "conflicts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clause_a_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clauses.id"))
    clause_b_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("clauses.id"))
    conflict_type: Mapped[str] = mapped_column(Enum('contradiction', 'overlap', 'ambiguity', name='conflict_type_enum'))
    description: Mapped[str] = mapped_column(Text)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolution_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    detected_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    jurisdiction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("jurisdictions.id"))
    status: Mapped[str] = mapped_column(Enum('pending', 'running', 'completed', 'failed', name='crawl_status_enum'))
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    documents_found: Mapped[int] = mapped_column(Integer, default=0)
    errors: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
