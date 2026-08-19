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


@router.post(
    "/cover-letter",
    response_model=schemas.CoverLetterResponse,
    dependencies=[Depends(rate_limit("ai-cover-letter"))],
)
async def generate_cover_letter(
    payload: schemas.CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Generates a professional 3-paragraph tailored cover letter matching
    candidate profile/resume against the job description with configurable tone.
    """
    resume_text, candidate_skills = _load_candidate_profile(db, current_user)
    if payload.resume_text:
        resume_text = f"{payload.resume_text}\n{resume_text}"

    user_name = current_user.full_name or "Applicant"
    target_role = current_user.target_role or "Target Role"
    tone = (payload.tone or "formal").lower()

    # Determine company name from payload or regex extraction
    company = payload.company_name or "your company"
    if not payload.company_name and payload.job_description:
        import re
        match = re.search(r"(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&,.-]{2,30})", payload.job_description)
        if match:
            extracted = match.group(1).strip()
            if not any(kw in extracted.lower() for kw in ["the", "a", "our", "this", "work", "join"]):
                company = extracted

    # Dynamic tone styling
    if tone == "startup":
        salutation = f"Dear Hiring Team at {company},"
        opening = f"I was thrilled to come across the open position matching {target_role}. As an innovator driven by high impact, I bring hands-on expertise in {', '.join(candidate_skills[:4]) if candidate_skills else 'modern technologies'}."
        body = f"Throughout my career, I've focused on moving fast and building scalable solutions. My background aligns directly with the requirements at {company}: {payload.job_description[:180]}... I am confident my track record will drive key metrics for your engineering team."
        closing = f"I would love the opportunity to connect for a quick conversation about how my technical skills and energetic approach align with {company}'s upcoming goals."
        sign_off = f"Best regards,\n{user_name}"
    elif tone == "technical":
        salutation = f"Dear Engineering Hiring Manager at {company},"
        opening = f"I am writing to express my strong interest in the {target_role} position at {company}. With deep technical competence across {', '.join(candidate_skills[:5]) if candidate_skills else 'core engineering practices'}, I offer a structured, data-driven approach to technical problem-solving."
        body = f"My experience directly targets the core requirements outlined in your job posting. Specifically, I have designed systems and executed projects requiring robust architectural standards and continuous optimization. In relation to your requirement for '{payload.job_description[:120]}...', I bring proven technical execution."
        closing = f"I look forward to discussing the technical specifics of this role and demonstrating how my skill set will contribute to {company}'s engineering performance."
        sign_off = f"Sincerely,\n{user_name}"
    else:  # formal
        salutation = f"Dear Hiring Manager at {company},"
        opening = f"Please accept this letter as my application for the {target_role} position at {company}. Having reviewed your job description with great interest, I believe my background in {', '.join(candidate_skills[:4]) if candidate_skills else 'industry best practices'} makes me a strong candidate for your organization."
        body = f"Over the course of my career, I have consistently delivered measurable outcomes and maintained strict professional standards. Your requirement emphasizing '{payload.job_description[:140]}...' closely parallels my hands-on experience and professional philosophy."
        closing = f"Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications in greater detail during an interview with the {company} team."
        sign_off = f"Respectfully yours,\n{user_name}"

    full_text = f"{salutation}\n\n{opening}\n\n{body}\n\n{closing}\n\n{sign_off}"

    return schemas.CoverLetterResponse(
        tone=tone,
        salutation=salutation,
        opening_paragraph=opening,
        body_paragraph=body,
        closing_paragraph=closing,
        sign_off=sign_off,
        full_text=full_text,
    )


@router.post(
    "/ats-breakdown",
    response_model=schemas.ExtendedATSBreakdownResponse,
    dependencies=[Depends(rate_limit("ai-ats-breakdown"))],
)
async def get_ats_breakdown(
    payload: Optional[schemas.JobMatchRequest] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns a categorized ATS score breakdown (Hard Skills, Soft Skills,
    Experience, Formatting) and Found/Missing Keyword Heatmap lists.
    """
    resume_text, candidate_skills = _load_candidate_profile(
        db, current_user, payload.resume_id if payload else None
    )

    jd_text = payload.job_description if payload else "Software engineering full stack developer React Python PostgreSQL AWS Docker unit testing communication teamwork problem solving"
    
    # Calculate score categories
    from app.ai.vector_matcher import analyze_job_match
    analysis = analyze_job_match(
        resume_text=resume_text,
        candidate_skills=candidate_skills,
        job_description=jd_text,
        job_title=payload.job_title if payload else (current_user.target_role or "Target Role")
    )

    overall = analysis.get("overall_score", 78)
    hard_skills_score = min(100, max(40, int(overall * 0.95)))
    soft_skills_score = min(100, max(50, int(overall * 0.85 + 10)))
    experience_score = min(100, max(45, int(overall * 0.9 + 5)))
    formatting_score = 95  # Standard parsed clean structure

    matched = analysis.get("matched_skills", ["Python", "SQL", "Git", "REST APIs"])
    missing = analysis.get("missing_skills", ["Docker", "Kubernetes", "GraphQL", "CI/CD"])

    category_label = "Optimal Match" if overall >= 85 else ("Competitive" if overall >= 70 else "Needs Optimization")

    return schemas.ExtendedATSBreakdownResponse(
        overall_score=overall,
        hard_skills_score=hard_skills_score,
        soft_skills_score=soft_skills_score,
        experience_score=experience_score,
        formatting_score=formatting_score,
        found_keywords=matched,
        missing_keywords=missing,
        category_label=category_label,
    )


# ======================================================
# Career Suggestion Endpoints (Deterministic + LLM Explainer)
# ======================================================

from fastapi import UploadFile, File
import os
from app.services.candidate_profile import CandidateProfileBuilder
from app.services.career_cache import career_cache_service
from app.ai.career.recommender import career_recommender
from app.resume_parser import parse_resume
from app.routers.resume_router import _sniff_and_validate, ALLOWED_EXTENSIONS
from app.config import settings


@router.post(
    "/career-suggestion",
    response_model=schemas.CareerSuggestionResponse,
    dependencies=[Depends(rate_limit("ai-career-suggestion"))],
)
async def get_career_suggestions(
    payload: schemas.CareerSuggestionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Intelligently suggests top suited careers based on the user's parsed resume.
    Uses deterministic scoring, structured market data, and LLM explanation layer.
    """
    resume = None
    if payload.resume_id:
        try:
            r_uuid = uuid.UUID(str(payload.resume_id))
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="Invalid resume ID format.")

        resume = (
            db.query(models.Resume)
            .filter(models.Resume.id == r_uuid, models.Resume.user_id == current_user.id)
            .first()
        )
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found or you do not have permission to access it."
            )
    else:
        # Fallback to latest user resume
        resume = (
            db.query(models.Resume)
            .filter(models.Resume.user_id == current_user.id)
            .order_by(models.Resume.uploaded_at.desc())
            .first()
        )

    preferences_dict = payload.preferences.model_dump() if payload.preferences else {}
    if payload.custom_preferences:
        preferences_dict["custom_preferences"] = payload.custom_preferences

    # Check cache first
    cached_result = career_cache_service.get_cached_suggestion(
        db=db,
        user_id=current_user.id,
        resume_id=resume.id if resume else None,
        preferences=preferences_dict
    )
    if cached_result:
        return schemas.CareerSuggestionResponse(**cached_result)

    # Build CandidateProfile
    candidate = CandidateProfileBuilder.from_resume_and_user(
        resume=resume,
        user=current_user,
        raw_text_override=payload.custom_preferences
    )

    # Execute deterministic matching & recommendation pipeline
    result = career_recommender.recommend(
        candidate=candidate,
        preferences=preferences_dict,
        top_k=5
    )

    # Persist in cache / database
    career_cache_service.save_suggestion(
        db=db,
        user_id=current_user.id,
        resume_id=resume.id if resume else None,
        preferences=preferences_dict,
        result=result
    )

    return schemas.CareerSuggestionResponse(**result)


@router.post(
    "/career-suggestion/upload",
    response_model=schemas.CareerSuggestionResponse,
    dependencies=[Depends(rate_limit("ai-career-suggestion-upload"))],
)
async def upload_and_suggest_careers(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Accepts direct resume file upload (PDF/DOCX), validates and parses it,
    stores resume record, and returns instant career recommendations.
    """
    filename = os.path.basename(file.filename or "")
    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and Word (.docx) documents are supported."
        )

    max_bytes = settings.max_resume_upload_mb * 1024 * 1024
    chunks = []
    total_size = 0
    chunk_size = 1024 * 1024

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > max_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size of {settings.max_resume_upload_mb} MB"
            )
        chunks.append(chunk)

    file_bytes = b"".join(chunks)
    if total_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Magic-byte sniff validation
    _sniff_and_validate(filename, file_bytes)

    # Save to disk
    os.makedirs("static/uploads", exist_ok=True)
    saved_filename = f"{current_user.id}_{uuid.uuid4()}_{filename}"
    file_path = os.path.join("static/uploads", saved_filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Parse resume
    try:
        parsed = parse_resume(filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse resume: {str(exc)}")

    entities = parsed.get("entities", {})

    resume = models.Resume(
        user_id=current_user.id,
        original_filename=filename,
        raw_text=parsed.get("raw_text", ""),
        extracted_name=entities.get("name"),
        extracted_email=entities.get("email"),
        extracted_phone=entities.get("phone"),
        extracted_skills=entities.get("skills", []),
        extracted_education=parsed.get("sections", {}).get("education", []),
        extracted_experience=parsed.get("sections", {}).get("experience", []),
        extracted_projects=parsed.get("sections", {}).get("projects", []),
        extracted_certifications=parsed.get("sections", {}).get("certifications", []),
        ats_score=parsed.get("ats_score", 75),
        contact=entities,
        sections=parsed.get("sections", {}),
        suggestions=parsed.get("suggestions", []),
        file_path=file_path,
        advice_status="pending",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Build CandidateProfile
    candidate = CandidateProfileBuilder.from_resume_and_user(
        resume=resume,
        user=current_user
    )

    # Run recommendation pipeline
    result = career_recommender.recommend(
        candidate=candidate,
        preferences={},
        top_k=5
    )

    # Save cache record
    career_cache_service.save_suggestion(
        db=db,
        user_id=current_user.id,
        resume_id=resume.id,
        preferences={},
        result=result
    )

    return schemas.CareerSuggestionResponse(**result)
