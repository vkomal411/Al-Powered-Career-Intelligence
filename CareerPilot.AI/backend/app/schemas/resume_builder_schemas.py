"""
Pydantic validation schemas for CareerPilot.AI Resume Builder Ecosystem.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class BulletPointModel(BaseModel):
    text: str
    metrics: Optional[Dict[str, Any]] = None


class ExperienceCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    bullets: List[str] = []
    metrics: Optional[Dict[str, Any]] = None


class ExperienceResponse(ExperienceCreate):
    id: str
    section_id: str
    ai_score: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "Technical"
    proficiency: Optional[str] = "intermediate"


class SkillResponse(SkillCreate):
    id: str
    section_id: str
    endorsed: bool = False
    endorsement_count: int = 0

    class Config:
        from_attributes = True


class ResumeSectionCreate(BaseModel):
    section_type: str
    content: Dict[str, Any]


class ResumeSectionResponse(ResumeSectionCreate):
    id: str
    resume_id: str
    ai_score: Optional[float] = None
    ai_feedback: Optional[str] = None

    class Config:
        from_attributes = True


class ResumeCreate(BaseModel):
    title: str = "My Professional Resume"
    target_role: Optional[str] = "Software Engineer"


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_role: Optional[str] = None
    status: str
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ATSScoreResponse(BaseModel):
    id: str
    resume_id: str
    score: int
    keyword_matches: int
    formatting_issues: List[str]
    suggestions: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


class JobMatchCreate(BaseModel):
    job_title: str = "Target Job"
    job_description: str


class JobMatchResponse(BaseModel):
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    experience_match: bool


class BulletEnhanceRequest(BaseModel):
    experience_id: str
    bullets: List[str]


class BulletEnhanceResponse(BaseModel):
    original: str
    suggestions: List[str]
    selected: Optional[str] = None
