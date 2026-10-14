import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class CareerSuggestion(Base):
    __tablename__ = "career_suggestions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=True, index=True)
    preferences = Column(JSON, nullable=True)
    summary = Column(String, nullable=True)
    candidate_strengths = Column(JSON, nullable=True)
    recommended_certifications = Column(JSON, nullable=True)
    engine_version = Column(String, default="career-v1", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    resume = relationship("Resume")
    items = relationship("CareerSuggestionItem", back_populates="suggestion", cascade="all, delete-orphan")


class CareerSuggestionItem(Base):
    __tablename__ = "career_suggestion_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    suggestion_id = Column(UUID(as_uuid=True), ForeignKey("career_suggestions.id"), nullable=False, index=True)
    career_id = Column(String, nullable=False, index=True)
    career_title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    match_score = Column(Float, nullable=False)
    match_level = Column(String, nullable=False)
    matching_skills = Column(JSON, nullable=False)
    missing_skills = Column(JSON, nullable=False)
    transition_difficulty = Column(String, nullable=False)
    why_fit = Column(String, nullable=True)
    growth_trajectory = Column(String, nullable=True)
    recommended_steps = Column(JSON, nullable=True)
    salary_snapshot = Column(JSON, nullable=True)
    market_demand_snapshot = Column(String, nullable=True)
    is_alternative = Column(String, default="false", nullable=False)

    suggestion = relationship("CareerSuggestion", back_populates="items")
