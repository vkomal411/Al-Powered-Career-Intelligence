import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth_utils import get_current_user
from app.rate_limit import rate_limit
from app.ai.job_recommender import recommend_jobs_for_candidate, JOB_DATASET

logger = logging.getLogger("career_platform")

router = APIRouter(prefix="/jobs", tags=["Job Recommendations & Saved Jobs"])



@router.get(
    "/recommendations",
    response_model=schemas.JobRecommendationResponse,
    dependencies=[Depends(rate_limit("jobs-recommendations"))],
)
async def get_job_recommendations(
    location: Optional[str] = Query(None, description="Location search query (e.g. Remote, Austin, India)"),
    work_type: Optional[str] = Query(None, description="Work type filter: Remote, Hybrid, Onsite, or All"),
    experience_level: Optional[str] = Query(None, description="Experience level filter: Entry, Mid, Senior, Executive"),
    min_score: int = Query(0, ge=0, le=100, description="Minimum overall match percentage"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recommendations"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Computes personalized multi-factor job recommendations for the authenticated user based on
    profile skills, extracted resume data, education qualifications, and experience level.
    """
    candidate_skills = list(set(current_user.skills or []))
    candidate_education = current_user.education or []

    # Pull latest user resume for extracted skills/education if profile fields are sparse
    latest_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).order_by(models.Resume.uploaded_at.desc()).first()

    candidate_resume_text = ""
    if latest_resume:
        if latest_resume.extracted_skills:
            candidate_skills = list(set(candidate_skills + latest_resume.extracted_skills))
        if latest_resume.extracted_education and not candidate_education:
            candidate_education = latest_resume.extracted_education
        candidate_resume_text = latest_resume.raw_text or ""

    # Fetch user's saved jobs for preference scoring & is_saved flagging
    saved_jobs_db = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).all()
    saved_jobs_data = [
        {
            "job_id": sj.job_id,
            "job_title": sj.job_title,
            "location": sj.location,
            "work_type": sj.work_type
        }
        for sj in saved_jobs_db
    ]

    recommended = recommend_jobs_for_candidate(
        candidate_skills=candidate_skills,
        candidate_education=candidate_education,
        candidate_exp_level=current_user.experience_level,
        candidate_resume_text=candidate_resume_text,
        location_filter=location,
        work_type_filter=work_type,
        exp_level_filter=experience_level,
        min_score=min_score,
        limit=limit,
        saved_jobs_data=saved_jobs_data
    )

    return schemas.JobRecommendationResponse(
        total_count=len(recommended),
        recommended_jobs=recommended
    )


@router.post(
    "/saved",
    response_model=schemas.SavedJobResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("jobs-save"))],
)
async def save_job_bookmark(
    payload: schemas.SaveJobRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Bookmarks/saves a job posting for the authenticated user. Idempotent if already saved.
    """
    existing = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == payload.job_id
    ).first()

    if existing:
        return existing

    saved_entry = models.SavedJob(
        user_id=current_user.id,
        job_id=payload.job_id,
        job_title=payload.job_title,
        company=payload.company,
        location=payload.location,
        work_type=payload.work_type,
        salary_range=payload.salary_range,
        job_data=payload.job_data or {}
    )

    db.add(saved_entry)
    db.commit()
    db.refresh(saved_entry)

    return saved_entry


@router.delete(
    "/saved/{job_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(rate_limit("jobs-unsave"))],
)
async def remove_saved_job_bookmark(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Removes a bookmarked job for the authenticated user.
    """
    existing = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id,
        models.SavedJob.job_id == job_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job bookmark not found."
        )

    db.delete(existing)
    db.commit()

    return {"detail": "Job bookmark removed successfully", "job_id": job_id}


@router.get(
    "/saved",
    response_model=List[schemas.SavedJobResponse],
    dependencies=[Depends(rate_limit("jobs-list-saved"))],
)
async def list_saved_jobs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns all bookmarked/saved jobs for the authenticated user.
    """
    saved_jobs = db.query(models.SavedJob).filter(
        models.SavedJob.user_id == current_user.id
    ).order_by(models.SavedJob.saved_at.desc()).all()

    return saved_jobs
