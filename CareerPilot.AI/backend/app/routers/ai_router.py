import logging
import uuid
from typing import Optional, Tuple, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth_utils import get_current_user
from app.rate_limit import rate_limit
from app.ai.vector_matcher import analyze_job_match
from app.ai.llm_advisor import get_ai_career_advice
from app.ai.skill_gap_engine import analyze_skill_gaps

logger = logging.getLogger("career_platform")

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


def _load_candidate_profile(
    db: Session,
    current_user: models.User,
    resume_id: Optional[Any] = None,
) -> Tuple[str, list]:
    """Load the user's latest (or requested) resume text + merged skill list."""
    resume_text = ""
    candidate_skills = current_user.skills or []

    resume = None
    if resume_id:
        try:
            r_uuid = uuid.UUID(str(resume_id)) if isinstance(resume_id, str) else resume_id
            resume = db.query(models.Resume).filter(
                models.Resume.id == r_uuid,
                models.Resume.user_id == current_user.id
            ).first()
        except Exception:
            resume = None

    if not resume:
        resume = db.query(models.Resume).filter(
            models.Resume.user_id == current_user.id
        ).order_by(models.Resume.uploaded_at.desc()).first()

    if resume:
        resume_text = f"{resume.raw_text or ''}\n{resume.extracted_name or ''}\n{resume.original_filename}\nSkills: {', '.join(resume.extracted_skills or [])}"
        if resume.extracted_skills:
            candidate_skills = list(set(candidate_skills + (resume.extracted_skills or [])))

    return resume_text, candidate_skills


@router.post(
    "/match-job",
    response_model=schemas.JobMatchResponse,
    dependencies=[Depends(rate_limit("ai-match-job"))],
)
async def match_job_description(
    payload: schemas.JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Computes semantic vector similarity and skill gap analysis
    between the user's uploaded resume/profile and a job description.
    """
    resume_text, candidate_skills = _load_candidate_profile(db, current_user, payload.resume_id)

    analysis = analyze_job_match(
        resume_text=resume_text,
        candidate_skills=candidate_skills,
        job_description=payload.job_description,
        job_title=payload.job_title or current_user.target_role or "Target Role"
    )

    return schemas.JobMatchResponse(**analysis)


@router.post(
    "/skill-gap-analysis",
    response_model=schemas.SkillGapAnalysisResponse,
    dependencies=[Depends(rate_limit("ai-skill-gap-analysis"))],
)
async def skill_gap_analysis(
    payload: schemas.SkillGapAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Ontology-driven skill gap analysis (v2): resolves candidate skills against a
    market-informed taxonomy, infers proficiency, ranks gaps by market impact and
    produces a prioritized learning roadmap.
    """
    resume_text, candidate_skills = _load_candidate_profile(db, current_user, payload.resume_id)

    analysis = analyze_skill_gaps(
        target_role=payload.job_title or current_user.target_role or "Senior Software Engineer",
        job_description=payload.job_description or "",
        candidate_skills=candidate_skills,
        resume_text=resume_text,
        experience_level=payload.experience_level or current_user.experience_level or "mid_level",
    )

    return schemas.SkillGapAnalysisResponse(**analysis)


@router.post(
    "/career-advice",
    response_model=schemas.CareerAdviceResponse,
    dependencies=[Depends(rate_limit("ai-career-advice"))],
)
async def get_career_advice(
    payload: schemas.CareerAdviceRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Generates personalized AI career guidance, key profile strengths,
    improvement areas, and an actionable growth plan.
    """
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).order_by(models.Resume.uploaded_at.desc()).first()

    user_profile_data = {
        "full_name": current_user.full_name,
        "target_role": payload.target_role or current_user.target_role or "Software Engineer",
        "experience_level": current_user.experience_level or "Mid-Level",
        "industry": current_user.industry or "Technology",
        "skills": current_user.skills or []
    }

    resume_data = {
        "extracted_skills": latest_resume.extracted_skills if latest_resume else [],
        "ats_score": latest_resume.ats_score if latest_resume else None
    }

    advice = get_ai_career_advice(
        user_profile=user_profile_data,
        resume_data=resume_data,
        custom_prompt=payload.custom_prompt or ""
    )

    return schemas.CareerAdviceResponse(**advice)
