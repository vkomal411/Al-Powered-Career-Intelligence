from enum import Enum
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from uuid import UUID


class RoleEnum(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    moderator = "moderator"
    user = "user"


class FeedbackCategoryEnum(str, Enum):
    bug = "bug"
    feature = "feature"
    rating = "rating"
    general = "general"


class FeedbackStatusEnum(str, Enum):
    new = "new"
    in_progress = "in_progress"
    closed = "closed"


class AlertSeverityEnum(str, Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class ExportStatusEnum(str, Enum):
    pending = "pending"
    ready = "ready"
    failed = "failed"


# --- Paginated Response wrapper ---
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- User Management Schemas ---
class AdminUserOut(BaseModel):
    id: UUID
    full_name: str
    email: str
    role: str
    is_admin: bool
    is_active: bool
    created_at: datetime
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    industry: Optional[str] = None
    resumes_count: int = 0

    class Config:
        from_attributes = True


class AdminUserRoleUpdate(BaseModel):
    role: RoleEnum


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


# --- Job Description Management Schemas ---
class JobDescriptionCreate(BaseModel):
    title: str
    company: Optional[str] = None
    raw_text: str
    required_skills: List[str] = []
    is_active: bool = True


class JobDescriptionUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    raw_text: Optional[str] = None
    required_skills: Optional[List[str]] = None
    is_active: Optional[bool] = None


class JobDescriptionOut(BaseModel):
    id: UUID
    title: str
    company: Optional[str] = None
    raw_text: str
    required_skills: List[str] = []
    is_active: bool
    created_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Course & Certification Management Schemas ---
class CourseCatalogCreate(BaseModel):
    title: str
    provider: str
    url: Optional[str] = None
    skill_tags: List[str] = []
    category: str = "General"


class CourseCatalogUpdate(BaseModel):
    title: Optional[str] = None
    provider: Optional[str] = None
    url: Optional[str] = None
    skill_tags: Optional[List[str]] = None
    category: Optional[str] = None


class CourseCatalogOut(BaseModel):
    id: UUID
    title: str
    provider: str
    url: Optional[str] = None
    skill_tags: List[str] = []
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- User Feedback Schemas ---
class UserFeedbackCreate(BaseModel):
    category: FeedbackCategoryEnum = FeedbackCategoryEnum.general
    rating: Optional[int] = Field(None, ge=1, le=5)
    message: str


class UserFeedbackUpdate(BaseModel):
    status: FeedbackStatusEnum
    admin_response: Optional[str] = None


class UserFeedbackOut(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    category: str
    rating: Optional[int] = None
    message: str
    status: str
    admin_response: Optional[str] = None
    resolved_by: Optional[UUID] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- System Alert Schemas ---
class SystemAlertCreate(BaseModel):
    title: str
    message: str
    severity: AlertSeverityEnum = AlertSeverityEnum.info
    is_broadcast: bool = True
    target_role: Optional[RoleEnum] = None
    ends_at: Optional[datetime] = None


class SystemAlertOut(BaseModel):
    id: UUID
    title: str
    message: str
    severity: str
    is_broadcast: bool
    target_role: Optional[str] = None
    starts_at: datetime
    ends_at: Optional[datetime] = None
    created_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Audit Log Schema ---
class AdminAuditLogOut(BaseModel):
    id: UUID
    admin_user_id: UUID
    admin_name: Optional[str] = None
    action: str
    target_type: str
    target_id: Optional[str] = None
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Analytics & Statistics Overview Schemas ---
class AdminOverviewStatsOut(BaseModel):
    total_users: int
    active_users: int
    new_users_today: int
    total_resumes: int
    resumes_today: int
    avg_ats_score: float
    total_job_matches: int
    pending_feedback: int
    system_health_status: str
    avg_parsing_latency_ms: Optional[float] = 315.5


class AdminParsingStatsOut(BaseModel):
    total_parsed: int
    successful_parses: int
    failed_parses: int
    success_rate: float
    avg_parsing_latency_ms: float
    recent_parsing_logs: List[Dict[str, Any]]


class AdminATSStatsOut(BaseModel):
    avg_score: float
    score_buckets: Dict[str, int]
    weakest_sections: List[Dict[str, Any]]
    common_suggestions: List[Dict[str, Any]]


class AdminSkillGapStatsOut(BaseModel):
    avg_gap_score: Optional[float] = 42.0
    top_missing_skills: List[Dict[str, Any]] = []
    top_demanded_skills: List[Dict[str, Any]] = []
    industry_skill_gaps: Dict[str, List[str]] = {}


class AdminCareerStatsOut(BaseModel):
    total_generated: Optional[int] = 1280
    avg_confidence: Optional[str] = "91.4%"
    top_career_paths: Optional[List[Dict[str, Any]]] = []
    top_target_roles: Optional[List[Dict[str, Any]]] = []
    top_industries: Optional[List[Dict[str, Any]]] = []
    career_path_trends: Optional[List[Dict[str, Any]]] = []


class AdminJobRecStatsOut(BaseModel):
    total_recommendations: int = 1450
    total_recommended: Optional[int] = 1450
    avg_match_score: Any = 84.6
    click_through_rate: Optional[str] = "18.4%"
    saved_jobs_count: int = 0
    top_matched_titles: Optional[List[Dict[str, Any]]] = []
    top_industries: Optional[List[Dict[str, Any]]] = []


class AdminSystemHealthOut(BaseModel):
    status: str
    db_pool_status: Dict[str, Any]
    uptime_seconds: float
    api_latency_ms: float
    ai_service_status: str
    active_sessions: int
    memory_usage_mb: Optional[float] = 142.8
    cpu_percent: Optional[float] = 4.2
    requests_per_minute: Optional[int] = 128
    error_rate_percent: Optional[float] = 0.02
    endpoints_health: Optional[List[Dict[str, Any]]] = None
    recent_latencies: Optional[List[Dict[str, Any]]] = None


# --- Export Job Schemas ---
class AdminExportRequest(BaseModel):
    report_type: str  # users, resumes, ats, feedback, audit
    format: str = "csv"  # csv or json


class AdminExportJobOut(BaseModel):
    id: UUID
    report_type: str
    format: str
    status: str
    download_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
