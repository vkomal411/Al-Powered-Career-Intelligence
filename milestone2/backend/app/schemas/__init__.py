import re
import uuid
from datetime import datetime
from typing import Optional, List, Union

from pydantic import BaseModel, EmailStr, field_validator, Field

PASSWORD_MIN_LENGTH = 8


def _validate_password_strength(password: str) -> str:
    if len(password) < PASSWORD_MIN_LENGTH:
        raise ValueError(f"Password must be at least {PASSWORD_MIN_LENGTH} characters long")
    if len(password) > 128:
        # bcrypt only uses the first 72 bytes; also guards against
        # oversized-payload abuse.
        raise ValueError("Password must be at most 128 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError("Password must contain at least one special character")
    return password


class EducationEntry(BaseModel):
    school: str = Field(..., max_length=200)
    degree: str = Field(..., max_length=200)
    field_of_study: str = Field(..., max_length=200)
    start_date: str = Field(..., max_length=50)
    end_date: str = Field(..., max_length=50)


class CertificationEntry(BaseModel):
    name: str = Field(..., max_length=200)
    issuer: str = Field(..., max_length=200)
    issue_date: str = Field(..., max_length=50)
    file_url: Optional[str] = Field(default=None, max_length=500)
    file_name: Optional[str] = Field(default=None, max_length=200)


class ProjectEntry(BaseModel):
    name: str = Field(..., max_length=200)
    description: str = Field(..., max_length=1000)
    url: Optional[str] = Field(default=None, max_length=500)


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @field_validator("full_name")
    @classmethod
    def full_name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be blank")
        if len(v) > 200:
            raise ValueError("Full name is too long")
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class GoogleLoginRequest(BaseModel):
    id_token: str


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    industry: Optional[str] = None
    has_password: bool
    education: Optional[List[EducationEntry]] = None
    skills: Optional[List[str]] = None
    certifications: Optional[List[CertificationEntry]] = None
    projects: Optional[List[ProjectEntry]] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None
    target_role: Optional[str] = Field(default=None, max_length=100)
    experience_level: Optional[str] = Field(default=None, max_length=50)
    industry: Optional[str] = Field(default=None, max_length=100)
    education: Optional[List[EducationEntry]] = Field(default=None, max_length=20)
    skills: Optional[List[str]] = Field(default=None, max_length=50)
    certifications: Optional[List[CertificationEntry]] = Field(default=None, max_length=20)
    projects: Optional[List[ProjectEntry]] = Field(default=None, max_length=20)

    @field_validator("skills")
    @classmethod
    def validate_skills_list(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return None
        cleaned = []
        for s in v:
            s_clean = s.strip()
            if not s_clean:
                continue
            if len(s_clean) > 100:
                raise ValueError("Individual skill string cannot exceed 100 characters")
            cleaned.append(s_clean)
        return cleaned

    @field_validator("full_name")
    @classmethod
    def full_name_not_blank(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be blank")
        if len(v) > 200:
            raise ValueError("Full name is too long")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ResumeResponse(BaseModel):
    id: uuid.UUID

    original_filename: str

    extracted_name: Optional[str] = None

    extracted_email: Optional[str] = None

    extracted_phone: Optional[str] = None

    extracted_skills: Optional[List[str]] = None

    extracted_education: Optional[List[dict]] = None

    extracted_experience: Optional[List[dict]] = None

    extracted_projects: Optional[List[dict]] = None

    extracted_certifications: Optional[List[str]] = None

    uploaded_at: datetime

    ats: Optional[dict] = None

    ai_career_advice: Optional[dict] = None
    ai_advice_generated_at: Optional[datetime] = None
    advice_status: str = "pending"

    class Config:
        from_attributes = True


class ResumeHistoryResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    extracted_email: Optional[str] = None
    extracted_phone: Optional[str] = None
    extracted_skills: Optional[List[str]] = None

    ats_score: Optional[int] = 0

    uploaded_at: datetime
    advice_status: Optional[str] = "pending"

    class Config:
        from_attributes = True


# ======================================================
# AI Intelligence Schemas
# ======================================================

class JobMatchRequest(BaseModel):
    job_title: Optional[str] = Field(default=None, max_length=150)
    job_description: str = Field(..., min_length=20, max_length=10000)
    resume_id: Optional[Union[uuid.UUID, str]] = None


class JobMatchResponse(BaseModel):
    overall_score: int
    semantic_similarity: float
    matched_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    recommendations: List[str]


class CareerAdviceRequest(BaseModel):
    target_role: Optional[str] = Field(default=None, max_length=150)
    custom_prompt: Optional[str] = Field(default=None, max_length=500)


class CareerAdviceResponse(BaseModel):
    summary: str
    key_strengths: List[str]
    improvement_areas: List[str]
    action_plan: List[str]
    suggested_certifications: List[str]


# ======================================================
# JD Matcher & Bullet Enhancer Schemas
# ======================================================

class JDMatchRequest(BaseModel):
    resume_id: Union[uuid.UUID, str]
    jd_text: str = Field(..., min_length=20, max_length=5000)


class JDMatchResponse(BaseModel):
    match_percentage: float
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]


class BulletEnhanceRequest(BaseModel):
    bullet_text: str = Field(..., min_length=5, max_length=500)


class BulletEnhanceResponse(BaseModel):
    original: str
    enhanced: str
    changes_summary: Optional[str] = None


# ======================================================
# Job Recommendation & Saved Jobs Schemas (Module 4)
# ======================================================

class JobMatchDetails(BaseModel):
    skill_score: int
    qualification_score: int
    experience_score: int
    semantic_score: Optional[int] = 0
    preference_score: Optional[int] = 0
    matched_skills: List[str]
    missing_skills: List[str]
    required_education: str
    match_rationale: str


class JobRecommendationItem(BaseModel):
    id: str
    title: str
    company: str
    location: str
    work_type: str  # Remote, Hybrid, Onsite
    experience_level: str  # Entry, Mid, Senior, Executive
    salary_range: str
    description: str
    required_skills: List[str]
    overall_score: int
    details: JobMatchDetails
    is_saved: bool = False
    apply_url: Optional[str] = None
    posted_date: Optional[str] = None


class JobRecommendationResponse(BaseModel):
    total_count: int
    recommended_jobs: List[JobRecommendationItem]


class SaveJobRequest(BaseModel):
    job_id: str
    job_title: str
    company: str
    location: str
    work_type: Optional[str] = None
    salary_range: Optional[str] = None
    job_data: Optional[dict] = None


class SavedJobResponse(BaseModel):
    id: uuid.UUID
    job_id: str
    job_title: str
    company: str
    location: str
    work_type: Optional[str] = None
    salary_range: Optional[str] = None
    job_data: Optional[dict] = None
    saved_at: datetime

    class Config:
        from_attributes = True


# =====================================================================
# CAREERPILOT AI RESUME STUDIO V2.0 SCHEMAS
# =====================================================================

class StudioExperienceSchema(BaseModel):
    id: Optional[str] = None
    company: str
    job_title: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    bullets: List[str] = []
    metrics: Optional[dict] = None

    class Config:
        from_attributes = True


class StudioEducationSchema(BaseModel):
    id: Optional[str] = None
    school: str
    degree: str
    location: Optional[str] = None
    graduation_date: Optional[str] = None
    gpa: Optional[str] = None
    honors: Optional[str] = None

    class Config:
        from_attributes = True


class StudioProjectSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    project_url: Optional[str] = None

    class Config:
        from_attributes = True


class StudioSkillSchema(BaseModel):
    id: Optional[str] = None
    name: str
    category: Optional[str] = "Technical"
    proficiency: Optional[str] = "intermediate"

    class Config:
        from_attributes = True


class StudioResumeCreate(BaseModel):
    title: str = "My AI Resume Studio"
    target_role: str = "UI/UX Designer"
    template_id: str = "modern"


class StudioResumeDTO(BaseModel):
    id: str
    title: str
    target_role: str
    template_id: str = "modern"
    status: str = "draft"
    version: int = 1

    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    summary: Optional[str] = None

    experiences: List[StudioExperienceSchema] = []
    educations: List[StudioEducationSchema] = []
    projects: List[StudioProjectSchema] = []
    skills: List[StudioSkillSchema] = []

    class Config:
        from_attributes = True


class StudioAIRewriteRequest(BaseModel):
    text: str
    target_role: Optional[str] = "UI/UX Designer"
    tone: Optional[str] = "Professional"


class StudioAIRewriteResponse(BaseModel):
    original: str
    rewritten: str
    suggestions: List[str] = []


class StudioATSScoreResponse(BaseModel):
    overall_score: int
    category_scores: dict
    formatting_issues: List[str]
    action_items: List[str]


class StudioJobMatchRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = "Target Role"


class StudioJobMatchResponse(BaseModel):
    match_score: float
    keyword_heatmap: dict
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]


# =====================================================================
# SKILL GAP ANALYSIS v2 SCHEMAS
# =====================================================================

class SkillGapResource(BaseModel):
    title: str
    provider: str
    url: str


class SkillGapItem(BaseModel):
    skill: str
    category: str
    status: str  # strength | partial | gap
    proficiency: float
    proficiency_label: str
    demand: int
    salary_impact: int
    trend: str
    priority: int
    weeks_to_learn: int
    blurb: str
    resource: Optional[SkillGapResource] = None
    certification: Optional[str] = None
    related: List[str] = []
    source: str = "profile"


class SkillGapCategory(BaseModel):
    category: str
    readiness: int
    total: int
    strengths: int
    partials: int
    gaps: int
    top_gap: Optional[str] = None


class RoadmapSkill(BaseModel):
    skill: str
    demand: int
    salary_impact: int
    trend: str
    weeks_to_learn: int
    why_it_matters: str
    resource: Optional[SkillGapResource] = None
    certification: Optional[str] = None


class RoadmapPhase(BaseModel):
    order: int
    title: str
    focus_area: str
    duration_weeks: int
    priority: str
    goal: str
    skills: List[RoadmapSkill]


class SkillGapCertification(BaseModel):
    name: str
    skill: str
    priority: str
    reason: str


class ProfileMatchSummary(BaseModel):
    matched: int
    partial: int
    gaps: int
    required: int
    readiness: int
    semantic_similarity: Optional[float] = None
    market_demand: int
    estimated_timeline_weeks: int


class SkillGapAnalysisRequest(BaseModel):
    job_title: Optional[str] = Field(default=None, max_length=150)
    job_description: Optional[str] = Field(default=None, max_length=10000)
    resume_id: Optional[uuid.UUID] = None
    experience_level: Optional[str] = Field(default=None, max_length=50)


class SkillGapAnalysisResponse(BaseModel):
    target_role: str
    source: str
    profile_title: str
    readiness_score: int
    readiness_level: str
    overall_score: int
    profile_match: ProfileMatchSummary
    matched_skill_count: int
    partial_skill_count: int
    gap_count: int
    total_required: int
    skills: List[SkillGapItem]
    categories: List[SkillGapCategory]
    roadmap: List[RoadmapPhase]
    strengths: List[str]
    partials: List[str]
    gaps: List[str]
    insights: List[str]
    next_actions: List[str]
    certifications_recommended: List[SkillGapCertification]
