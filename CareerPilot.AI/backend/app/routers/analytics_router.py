"""
Career Analytics & Intelligence Router for career.AI (Module 7)
Provides endpoint GET /analytics/career-overview with database caching.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.database import get_db
from app.auth_utils import get_current_user
from app.rate_limit import rate_limit
from app.ai.job_recommender import recommend_jobs_for_candidate

logger = logging.getLogger("career_platform")

router = APIRouter(prefix="/analytics", tags=["Career Analytics & Intelligence"])


@router.get(
    "/career-overview",
    dependencies=[Depends(rate_limit("analytics-overview"))],
)
async def get_career_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns aggregated career analytics snapshot with DB caching per resume version.
    """
    # 1. Fetch user's latest resume
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.user_id == current_user.id)
        .order_by(models.Resume.uploaded_at.desc())
        .first()
    )

    resume_id = latest_resume.id if latest_resume else None

    # 2. Check AnalyticsCache table first
    cache_entry = (
        db.query(models.AnalyticsCache)
        .filter(
            models.AnalyticsCache.user_id == current_user.id,
            models.AnalyticsCache.resume_version_id == resume_id
        )
        .first()
    )

    if cache_entry and cache_entry.metrics_json:
        logger.info("Serving career analytics from DB cache for user %s", current_user.id)
        return cache_entry.metrics_json

    # 3. Compute Metrics (Real-time calculation for fresh profile state)
    ats_score = latest_resume.ats_score if latest_resume and latest_resume.ats_score is not None else 0

    user_skills = set([s.lower() for s in (current_user.skills or [])])
    if latest_resume and latest_resume.extracted_skills:
        for s in latest_resume.extracted_skills:
            user_skills.add(s.lower())

    target_skills = ["python", "react", "docker", "sql", "fastapi", "typescript", "aws", "system design"]
    matched_skill_count = sum(1 for s in target_skills if s in user_skills)
    skill_coverage_pct = min(100, int((matched_skill_count / len(target_skills)) * 100))

    # Job match average rate from Module 4 recommender
    candidate_skills_list = list(user_skills)
    recommended_jobs = recommend_jobs_for_candidate(
        candidate_skills=candidate_skills_list,
        candidate_education=current_user.education or [],
        candidate_exp_level=current_user.experience_level,
        limit=5
    )

    avg_job_match = 0
    if recommended_jobs and isinstance(recommended_jobs, list) and len(recommended_jobs) > 0:
        scores = [j["overall_score"] for j in recommended_jobs if isinstance(j, dict) and "overall_score" in j]
        if scores:
            avg_job_match = int(sum(scores) / len(scores))
    elif ats_score > 0:
        avg_job_match = min(95, ats_score + 10)


    # Actionable Profile Checklist
    has_edu_exp = bool(current_user.education) or bool(current_user.projects) or (latest_resume and bool(latest_resume.work_experience))

    checklist = [
        {
            "id": "chk-target",
            "title": "Set your target job role",
            "is_completed": bool(current_user.target_role and current_user.target_role.strip()),
            "action_tab": "profile",
            "description": f"Currently set to: '{current_user.target_role or 'Not specified'}'"
        },
        {
            "id": "chk-resume",
            "title": "Upload your latest resume",
            "is_completed": bool(latest_resume),
            "action_tab": "resume",
            "description": "Upload a PDF or Word resume to unlock AI ATS scoring."
        },
        {
            "id": "chk-skills",
            "title": "Add at least 5 skills to profile",
            "is_completed": len(user_skills) >= 5,
            "action_tab": "profile",
            "description": f"{len(user_skills)} skill(s) currently identified."
        },
        {
            "id": "chk-education",
            "title": "Add education or experience details",
            "is_completed": has_edu_exp,
            "action_tab": "profile",
            "description": "Add education degrees, projects, or work history to improve job matching."
        },
        {
            "id": "chk-optimize",
            "title": "Review AI resume keyword suggestions",
            "is_completed": ats_score >= 75,
            "action_tab": "improvements",
            "description": "Optimize summary and bullet points to hit 75+ ATS score."
        }
    ]

    # Executive "What To Do Next" Summary
    next_action_title = "Upload Resume" if not latest_resume else ("Grow Your Skills" if skill_coverage_pct < 70 else "Apply to Top Job Matches")
    next_action_tab = "resume" if not latest_resume else ("courses" if skill_coverage_pct < 70 else "jobs")
    summary_text = (
        "Your profile shows strong potential. "
        f"You have matched {matched_skill_count}/{len(target_skills)} core target skills and achieve an average job match of {avg_job_match}%. "
        f"Focus next on closing key skill gaps in {target_skills[0].capitalize()} & {target_skills[1].capitalize()} to elevate your ATS score."
        if latest_resume else
        "Welcome! Upload your resume to calculate your baseline ATS score, skill coverage, and tailored job matches."
    )

    metrics_payload = {
        "resume_uploaded": bool(latest_resume),
        "resume_version_id": str(resume_id) if resume_id else None,
        "resume_score": {
            "score": ats_score,
            "label": "Strong Resume" if ats_score >= 80 else ("Good Start" if ats_score >= 60 else "Needs Optimization"),
            "explanation": "Evaluates keyword match density, section formatting, and impact metrics against recruiter benchmarks."
        },
        "skill_coverage": {
            "matched_count": matched_skill_count,
            "total_target_count": len(target_skills),
            "coverage_percentage": skill_coverage_pct,
            "matched_skills": [s.title() for s in target_skills if s in user_skills],
            "missing_skills": [s.title() for s in target_skills if s not in user_skills],
        },
        "job_market_fit": {
            "average_match_rate": avg_job_match,
            "total_available_matches": len(recommended_jobs) if isinstance(recommended_jobs, list) else 0
        },

        "profile_checklist": checklist,
        "what_to_do_next": {
            "summary": summary_text,
            "primary_action_title": next_action_title,
            "primary_action_tab": next_action_tab
        },
        "computed_at": datetime.now(timezone.utc).isoformat()
    }

    # 4. Save to AnalyticsCache
    try:
        new_cache = models.AnalyticsCache(
            user_id=current_user.id,
            resume_version_id=resume_id,
            metrics_json=metrics_payload
        )
        db.add(new_cache)
        db.commit()
    except Exception as exc:
        logger.warning("Could not persist AnalyticsCache: %s", exc)

    return metrics_payload
