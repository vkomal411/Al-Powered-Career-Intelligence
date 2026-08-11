"""
SQLAlchemy models for CareerPilot.AI Resume Builder Architecture.
Supports modular section storage, work experience entries, skill proficiencies,
ATS audit trail, job matcher results, bullet enhancements, and version snapshots.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    JSON,
    Float,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class ResumeBuilder(Base):
    __tablename__ = "resume_builder_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, default="My Professional Resume", nullable=False)
    target_role = Column(String, nullable=True)
    status = Column(String, default="draft", nullable=False)  # draft, published, archived
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    sections = relationship("ResumeSectionModel", back_populates="resume", cascade="all, delete-orphan")
    ats_scores = relationship("ATSScoreModel", back_populates="resume", cascade="all, delete-orphan")
    job_matches = relationship("JobMatchModel", back_populates="resume", cascade="all, delete-orphan")
    versions = relationship("ResumeVersionModel", back_populates="resume", cascade="all, delete-orphan")


class ResumeSectionModel(Base):
    __tablename__ = "resume_builder_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_documents.id"), nullable=False)
    section_type = Column(String, nullable=False)  # summary, experience, education, skills, certifications, projects
    content = Column(JSON, nullable=False, default=dict)
    ai_score = Column(Float, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    resume = relationship("ResumeBuilder", back_populates="sections")
    experience_entries = relationship("ResumeExperienceModel", back_populates="section", cascade="all, delete-orphan")
    skill_entries = relationship("ResumeSkillModel", back_populates="section", cascade="all, delete-orphan")


class ResumeExperienceModel(Base):
    __tablename__ = "resume_builder_experience"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_sections.id"), nullable=False)
    job_title = Column(String, nullable=True)
    company = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    bullets = Column(JSON, default=list)  # List of strings
    metrics = Column(JSON, default=dict)  # Metric key-values
    ai_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    section = relationship("ResumeSectionModel", back_populates="experience_entries")
    enhancements = relationship("BulletEnhancementModel", back_populates="experience", cascade="all, delete-orphan")


class ResumeSkillModel(Base):
    __tablename__ = "resume_builder_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_sections.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    category = Column(String, nullable=True, default="Technical")
    proficiency = Column(String, default="intermediate")
    endorsed = Column(Boolean, default=False)
    endorsement_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    section = relationship("ResumeSectionModel", back_populates="skill_entries")


class ATSScoreModel(Base):
    __tablename__ = "resume_builder_ats_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_documents.id"), nullable=False)
    score = Column(Integer, nullable=False, default=70)
    keyword_matches = Column(Integer, default=0)
    formatting_issues = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    resume = relationship("ResumeBuilder", back_populates="ats_scores")


class JobMatchModel(Base):
    __tablename__ = "resume_builder_job_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_documents.id"), nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    extracted_keywords = Column(JSON, default=list)
    match_score = Column(Float, nullable=False, default=75.0)
    missing_skills = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    resume = relationship("ResumeBuilder", back_populates="job_matches")


class BulletEnhancementModel(Base):
    __tablename__ = "resume_builder_bullet_enhancements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    experience_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_experience.id"), nullable=False)
    original_bullet = Column(Text, nullable=False)
    ai_suggestions = Column(JSON, default=list)
    selected_suggestion = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    experience = relationship("ResumeExperienceModel", back_populates="enhancements")


class ResumeVersionModel(Base):
    __tablename__ = "resume_builder_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resume_builder_documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    snapshot = Column(JSON, nullable=False)
    created_by_action = Column(String, default="edit")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    resume = relationship("ResumeBuilder", back_populates="versions")
