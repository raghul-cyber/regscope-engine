from typing import List, Dict, Optional
from collections import defaultdict
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.db.models import Clause, Document, Conflict
import structlog

logger = structlog.get_logger(__name__)

class ConflictResolver:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def detect_and_resolve(self, jurisdiction_id: uuid.UUID):
        """
        Detect conflicts and resolve canonical clauses for a given jurisdiction.
        """
        # Fetch all clauses for the jurisdiction
        stmt = (
            select(Clause, Document)
            .join(Document, Clause.document_id == Document.id)
            .where(Document.jurisdiction_id == jurisdiction_id)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        
        # Group clauses by topic
        # A clause can have multiple topics. We evaluate per topic.
        clauses_by_topic = defaultdict(list)
        for clause, doc in rows:
            for topic in clause.topics:
                clauses_by_topic[topic].append((clause, doc))
                
        canonical_clauses = {}
        
        for topic, items in clauses_by_topic.items():
            # Rank items:
            # 1. authority_tier (primary > secondary > guidance)
            # 2. effective_date (descending)
            
            tier_rank = {"primary": 3, "secondary": 2, "guidance": 1}
            
            def sort_key(item):
                c, d = item
                date_val = d.effective_date.isoformat() if d.effective_date else "0000-00-00"
                return (tier_rank.get(d.authority_tier, 0), date_val)
                
            sorted_items = sorted(items, key=sort_key, reverse=True)
            
            if not sorted_items:
                continue
                
            best_clause, best_doc = sorted_items[0]
            
            # Check for direct conflicts at the top tier
            if len(sorted_items) > 1:
                runner_up_clause, runner_up_doc = sorted_items[1]
                
                # If they have the same rank (tier and date), it's a conflict
                if sort_key(sorted_items[0]) == sort_key(sorted_items[1]):
                    # Are they contradictory types? (e.g., prohibition vs permission)
                    if best_clause.clause_type != runner_up_clause.clause_type and \
                       {best_clause.clause_type, runner_up_clause.clause_type}.intersection({"prohibition", "permission"}):
                        
                        await self._create_conflict_record(
                            clause_a=best_clause,
                            clause_b=runner_up_clause,
                            conflict_type="contradiction",
                            description=f"Contradictory rules on topic '{topic}' with equal authority."
                        )
                        # Flag both clauses
                        best_clause.flags.append("conflict")
                        runner_up_clause.flags.append("conflict")
                        
            # The top one is chosen as canonical
            supporting = [c.id for c, d in sorted_items[1:]]
            
            canonical_clauses[topic] = {
                "canonical_clause_id": best_clause.id,
                "authoritative_source_id": best_doc.id,
                "supporting_clause_ids": supporting
            }
            
        await self.db.commit()
        return canonical_clauses

    async def _create_conflict_record(self, clause_a: Clause, clause_b: Clause, conflict_type: str, description: str):
        # Check if already exists
        existing = await self.db.execute(
            select(Conflict).where(
                or_(
                    and_(Conflict.clause_a_id == clause_a.id, Conflict.clause_b_id == clause_b.id),
                    and_(Conflict.clause_a_id == clause_b.id, Conflict.clause_b_id == clause_a.id)
                )
            )
        )
        if existing.first():
            return
            
        conflict = Conflict(
            clause_a_id=clause_a.id,
            clause_b_id=clause_b.id,
            conflict_type=conflict_type,
            description=description
        )
        self.db.add(conflict)
        logger.info("conflict_detected", clause_a=str(clause_a.id), clause_b=str(clause_b.id))
