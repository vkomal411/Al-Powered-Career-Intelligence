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
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # nullable for Google-only accounts
    google_id = Column(String, unique=True, nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user", index=True, nullable=False)  # superadmin, admin, moderator, user
    is_admin = Column(Boolean, default=False, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Preferences & Profile settings
    target_role = Column(String, nullable=True)
    experience_level = Column(String, nullable=True)
    industry = Column(String, nullable=True)

    education = Column(JSON, nullable=True)
    skills = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    projects = Column(JSON, nullable=True)

    resumes = relationship("Resume", back_populates="owner")

    @property
    def has_password(self) -> bool:
        return self.hashed_password is not None


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    original_filename = Column(String, nullable=False)

    raw_text = Column(Text)

    extracted_name = Column(String, nullable=True)

    extracted_email = Column(String)

    extracted_phone = Column(String)

    extracted_skills = Column(JSON)

    extracted_education = Column(JSON, nullable=True)

    extracted_experience = Column(JSON, nullable=True)

    extracted_projects = Column(JSON, nullable=True)

    extracted_certifications = Column(JSON, nullable=True)

    # NEW FIELDS
    ats_score = Column(Integer)

    contact = Column(JSON)

    sections = Column(JSON)

    suggestions = Column(JSON)

    file_path = Column(String, nullable=True)

    ai_career_advice = Column(JSON, nullable=True)
    ai_advice_generated_at = Column(DateTime(timezone=True), nullable=True)
    advice_status = Column(String, default="pending", nullable=False)  # pending, ready, failed

    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="resumes")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    family_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    replaced_by_id = Column(UUID(as_uuid=True), ForeignKey("refresh_tokens.id"), nullable=True)

    user = relationship("User")
    replaced_by = relationship("RefreshToken", remote_side=[id])


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    job_id = Column(String, nullable=False, index=True)
    job_title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    work_type = Column(String, nullable=True)
    salary_range = Column(String, nullable=True)
    job_data = Column(JSON, nullable=True)
    saved_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")


class AnalyticsCache(Base):
    __tablename__ = "analytics_cache"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    resume_version_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id"), nullable=True)
    metrics_json = Column(JSON, nullable=False)
    computed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    resume = relationship("Resume")


# =====================================================================
# CAREERPILOT AI RESUME STUDIO V2.0 MODELS
# =====================================================================

class StudioResume(Base):
    __tablename__ = "studio_resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, default="My AI Resume", nullable=False)
    target_role = Column(String, nullable=True, default="UI/UX Designer")
    experience_level = Column(String, nullable=True, default="Senior")
    template_id = Column(String, default="modern", nullable=False)
    status = Column(String, default="draft", nullable=False)
    version = Column(Integer, default=1, nullable=False)
    
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    experiences = relationship("StudioExperience", back_populates="resume", cascade="all, delete-orphan")
    educations = relationship("StudioEducation", back_populates="resume", cascade="all, delete-orphan")
    projects = relationship("StudioProjects", back_populates="resume", cascade="all, delete-orphan")
    skills = relationship("StudioSkills", back_populates="resume", cascade="all, delete-orphan")
    certifications = relationship("StudioCertifications", back_populates="resume", cascade="all, delete-orphan")
    languages = relationship("StudioLanguages", back_populates="resume", cascade="all, delete-orphan")
    awards = relationship("StudioAwards", back_populates="resume", cascade="all, delete-orphan")

    ats_analyses = relationship("StudioATSAnalysis", back_populates="resume", cascade="all, delete-orphan")
    job_matches = relationship("StudioJobMatch", back_populates="resume", cascade="all, delete-orphan")
    versions = relationship("StudioResumeVersion", back_populates="resume", cascade="all, delete-orphan")


class StudioExperience(Base):
    __tablename__ = "studio_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    company = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    location = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    bullets = Column(JSON, default=list)
    metrics = Column(JSON, default=dict)
    order_index = Column(Integer, default=0)

    resume = relationship("StudioResume", back_populates="experiences")


class StudioEducation(Base):
    __tablename__ = "studio_educations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    school = Column(String, nullable=False)
    degree = Column(String, nullable=False)
    location = Column(String, nullable=True)
    graduation_date = Column(String, nullable=True)
    gpa = Column(String, nullable=True)
    honors = Column(String, nullable=True)
    order_index = Column(Integer, default=0)

    resume = relationship("StudioResume", back_populates="educations")


class StudioProjects(Base):
    __tablename__ = "studio_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String, nullable=True)
    project_url = Column(String, nullable=True)
    order_index = Column(Integer, default=0)

    resume = relationship("StudioResume", back_populates="projects")


class StudioSkills(Base):
    __tablename__ = "studio_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, default="Technical")
    proficiency = Column(String, default="intermediate")
    order_index = Column(Integer, default=0)

    resume = relationship("StudioResume", back_populates="skills")


class StudioCertifications(Base):
    __tablename__ = "studio_certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    name = Column(String, nullable=False)
    issuing_organization = Column(String, nullable=True)
    issue_date = Column(String, nullable=True)
    expiration_date = Column(String, nullable=True)
    credential_id = Column(String, nullable=True)

    resume = relationship("StudioResume", back_populates="certifications")


class StudioLanguages(Base):
    __tablename__ = "studio_languages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    language = Column(String, nullable=False)
    fluency = Column(String, default="Fluent")

    resume = relationship("StudioResume", back_populates="languages")


class StudioAwards(Base):
    __tablename__ = "studio_awards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=True)
    date_received = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    resume = relationship("StudioResume", back_populates="awards")


class StudioATSAnalysis(Base):
    __tablename__ = "studio_ats_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    overall_score = Column(Integer, nullable=False, default=85)
    
    structure_score = Column(Integer, default=90)
    formatting_score = Column(Integer, default=95)
    keywords_score = Column(Integer, default=80)
    skills_score = Column(Integer, default=85)
    experience_score = Column(Integer, default=88)
    readability_score = Column(Integer, default=92)
    completeness_score = Column(Integer, default=90)

    category_scores = Column(JSON, default=dict)
    formatting_issues = Column(JSON, default=list)
    action_items = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    resume = relationship("StudioResume", back_populates="ats_analyses")


class StudioJobMatch(Base):
    __tablename__ = "studio_job_matches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    match_score = Column(Integer, nullable=False, default=82)
    keyword_heatmap = Column(JSON, default=dict)
    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    suggestions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    resume = relationship("StudioResume", back_populates="job_matches")


class StudioResumeVersion(Base):
    __tablename__ = "studio_resume_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("studio_resumes.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    action_name = Column(String, default="auto-save")
    snapshot = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    resume = relationship("StudioResume", back_populates="versions")


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=False)
    target_id = Column(String, nullable=True)
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("idx_admin_audit_user_created", "admin_user_id", "created_at"),
    )

    admin_user = relationship("User", foreign_keys=[admin_user_id])


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    raw_text = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[created_by])


class CourseCatalog(Base):
    __tablename__ = "course_catalog"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    url = Column(String, nullable=True)
    skill_tags = Column(JSON, default=list)
    category = Column(String, default="General")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    category = Column(String, default="general")  # bug, feature, rating, general
    rating = Column(Integer, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String, default="new", index=True)  # new, in_progress, closed
    admin_response = Column(Text, nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_feedback_status_created", "status", "created_at"),
    )

    user = relationship("User", foreign_keys=[user_id])
    resolver = relationship("User", foreign_keys=[resolved_by])


class SystemAlert(Base):
    __tablename__ = "system_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="info")  # info, warning, critical
    is_broadcast = Column(Boolean, default=True)
    target_role = Column(String, nullable=True)
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    starts_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ends_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[created_by])
    target_user = relationship("User", foreign_keys=[target_user_id])


class AdminExportJob(Base):
    __tablename__ = "admin_export_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    report_type = Column(String, nullable=False)  # users, resumes, ats, feedback, audit
    format = Column(String, default="csv")  # csv, json
    status = Column(String, default="pending")  # pending, ready, failed
    file_path = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    admin_user = relationship("User", foreign_keys=[admin_user_id])


from app.models.resume_builder_models import (
    ResumeBuilder,
    ResumeSectionModel,
    ResumeExperienceModel,
    ResumeSkillModel,
    ATSScoreModel,
    JobMatchModel,
    BulletEnhancementModel,
    ResumeVersionModel,
)

from app.models.career_suggestion import CareerSuggestion, CareerSuggestionItem

__all__ = [
    "User",
    "Resume",
    "RefreshToken",
    "SavedJob",
    "AnalyticsCache",
    "StudioResume",
    "StudioExperience",
    "StudioEducation",
    "StudioProjects",
    "StudioSkills",
    "StudioCertifications",
    "StudioLanguages",
    "StudioAwards",
    "StudioATSAnalysis",
    "StudioJobMatch",
    "StudioResumeVersion",
    "AdminAuditLog",
    "JobDescription",
    "CourseCatalog",
    "UserFeedback",
    "SystemAlert",
    "AdminExportJob",
    "ResumeBuilder",
    "ResumeSectionModel",
    "ResumeExperienceModel",
    "ResumeSkillModel",
    "ATSScoreModel",
    "JobMatchModel",
    "BulletEnhancementModel",
    "ResumeVersionModel",
    "CareerSuggestion",
    "CareerSuggestionItem",
]




