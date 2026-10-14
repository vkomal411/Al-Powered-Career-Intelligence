"""
Career Roadmap Router.
API endpoints for generating personalized career roadmaps conforming to output_schema.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.ai.roadmap_generator import generate_ai_career_roadmap_v2
from app.auth_utils import get_current_user_optional
from app.models import User

router = APIRouter(prefix="/career", tags=["Career Roadmap"])


class RoadmapGenerateRequest(BaseModel):
    target_role: str = Field(..., example="ML Engineer")
    current_role: Optional[str] = Field("CS undergrad, 3rd year", example="CS undergrad, 3rd year")
    current_skills: Optional[List[str]] = Field(default_factory=list, example=["Python", "Git", "SQL"])
    experience_level: Optional[str] = Field("entry_level", example="entry_level")
    hours_per_week: Optional[int] = Field(15, example=15)
    timeline_months: Optional[int] = Field(6, example=6)
    constraints: Optional[str] = Field("None", example="Must keep current job")
    resume_summary: Optional[str] = Field(None, example="Parsed resume content")


@router.post("/roadmap/generate")
@router.post("/generate-roadmap")
def generate_roadmap(
    payload: RoadmapGenerateRequest,
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    target = payload.target_role.strip() if payload.target_role else "Senior Full-Stack Developer"
    current = payload.current_role.strip() if payload.current_role else "Developer"
    skills = payload.current_skills or []

    if current_user:
        if not target and current_user.target_role:
            target = current_user.target_role
        if current_user.skills and isinstance(current_user.skills, list):
            skills = list(set(skills + current_user.skills))

    roadmap_data = generate_ai_career_roadmap_v2(
        target_role=target,
        current_role=current,
        current_skills=skills,
        experience_level=payload.experience_level or "entry_level",
        hours_per_week=payload.hours_per_week or 15,
        timeline_months=payload.timeline_months or 6,
        constraints=payload.constraints or "None",
        resume_summary=payload.resume_summary
    )

    return {
        "status": "success",
        "data": roadmap_data
    }
