"""
Courses Router for career.AI (Module 5)
Provides endpoint GET /courses/recommendations
"""

import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.auth_utils import get_current_user
from app.rate_limit import rate_limit
from app.ai.course_recommender import generate_course_recommendations


ROLE_SKILL_HINTS = {
    "server": ["Linux", "AWS", "Docker", "System Design"],
    "system administrator": ["Linux", "AWS", "Docker", "System Design"],
    "infrastructure": ["Linux", "AWS", "Docker", "System Design"],
    "backend": ["Python", "FastAPI", "SQL", "Docker"],
    "api": ["Python", "FastAPI", "REST APIs", "SQL"],
    "frontend": ["React", "TypeScript", "SQL"],
    "web developer": ["React", "TypeScript", "SQL"],
    "data scientist": ["Python", "SQL", "Machine Learning"],
    "data analyst": ["Python", "SQL"],
    "machine learning": ["Python", "Machine Learning", "PyTorch"],
    "ai engineer": ["Python", "Machine Learning", "PyTorch"],
    "devops": ["Linux", "Docker", "AWS", "System Design"],
    "cloud": ["Linux", "Docker", "AWS", "System Design"],
    "product manager": ["Agile", "SQL", "System Design"],
}


def skills_for_role(role: str) -> List[str]:
    """Return catalog skill hints for both preset and user-entered job titles."""
    role_lower = (role or "").lower()
    for keyword, skills in ROLE_SKILL_HINTS.items():
        if keyword in role_lower:
            return skills
    return ["Python", "SQL", "Docker", "System Design"]

logger = logging.getLogger("career_platform")

router = APIRouter(prefix="/courses", tags=["Course & Skill-Gap Recommendations"])


@router.get(
    "/recommendations",
    dependencies=[Depends(rate_limit("courses-recommendations"))],
)
async def get_course_recommendations(
    missing_skills: Optional[str] = Query(None, description="Comma-separated missing skills"),
    target_role: Optional[str] = Query(None, description="Target job title or role"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns personalized course recommendations and ordered learning path timeline.
    """
    skills_list = []
    if missing_skills:
        skills_list = [s.strip() for s in missing_skills.split(",") if s.strip()]

    # If missing skills were not explicitly passed, attempt to extract gaps from user's latest resume or profile
    if not skills_list:
        latest_resume = (
            db.query(models.Resume)
            .filter(models.Resume.user_id == current_user.id)
            .order_by(models.Resume.uploaded_at.desc())
            .first()
        )

        user_target_role = target_role or current_user.target_role or "Software Engineer"
        user_skills = set([s.lower() for s in (current_user.skills or [])])

        if latest_resume and latest_resume.extracted_skills:
            for s in latest_resume.extracted_skills:
                user_skills.add(s.lower())

        # Build the course plan from the selected job title instead of using
        # the same generic skill list for every user.
        role_skills = skills_for_role(user_target_role)
        skills_list = [s for s in role_skills if s.lower() not in user_skills]

        # Default fallback if candidate already has all benchmark skills
        if not skills_list:
            skills_list = role_skills[:4]

    role = target_role or current_user.target_role or "Software Professional"
    result = generate_course_recommendations(missing_skills=skills_list, target_role=role)
    return result
