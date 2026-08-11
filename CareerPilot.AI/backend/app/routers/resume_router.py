import os
import uuid
import logging
from typing import Optional, List, Dict, Any

from pydantic import BaseModel
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, BackgroundTasks


logger = logging.getLogger("career_platform")
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, SessionLocal
from app import models, schemas
from app.auth_utils import get_current_user
from app.resume_parser import parse_resume
from app.ai.resume_optimizer import optimize_resume_content
from starlette.concurrency import run_in_threadpool


router = APIRouter(prefix="/resume", tags=["Resume"])

ALLOWED_EXTENSIONS = (".pdf", ".docx")

# Magic-byte signatures
PDF_MAGIC = b"%PDF-"


def _sniff_and_validate(filename: str, file_bytes: bytes) -> None:
    lower_name = filename.lower()

    if lower_name.endswith(".pdf"):
        if not file_bytes.startswith(PDF_MAGIC):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid PDF file. Please upload an authentic PDF document.",
            )

    elif lower_name.endswith(".docx"):
        if not file_bytes.startswith(b"PK"):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid DOCX file. Please upload a standard Microsoft Word .docx file.",
            )


# ======================================================
# Upload Resume
# ======================================================

from app.rate_limit import rate_limit

@router.post(
    "/upload",
    response_model=schemas.ResumeResponse,
    dependencies=[Depends(rate_limit("resume-upload"))],
)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    filename = os.path.basename(file.filename or "")

    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="We currently support PDF and Word (.docx) files. Please upload in one of those formats.",
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
                detail=f"File exceeds the maximum allowed size of {settings.max_resume_upload_mb} MB",
            )

        chunks.append(chunk)

    file_bytes = b"".join(chunks)

    if total_size == 0:
        raise HTTPException(
            status_code=400,
            detail="This file appears to be empty. Please check and try again.",
        )

    _sniff_and_validate(filename, file_bytes)

    try:
        parsed = await run_in_threadpool(parse_resume, filename, file_bytes)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse file: {str(exc)}",
        )

    new_resume_id = uuid.uuid4()
    upload_dir = os.path.join("static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    saved_file_path = os.path.join(upload_dir, f"{new_resume_id}_{filename}")
    try:
        with open(saved_file_path, "wb") as f:
            f.write(file_bytes)
    except Exception as exc:
        logger.warning("Could not save upload file to disk: %s", exc)
        saved_file_path = None

    resume = models.Resume(
        id=new_resume_id,
        user_id=current_user.id,
        original_filename=filename,

        raw_text=parsed["raw_text"],

        extracted_name=parsed.get("extracted_name"),

        extracted_email=parsed["extracted_email"],

        extracted_phone=parsed["extracted_phone"],

        extracted_skills=parsed["extracted_skills"],

        extracted_education=parsed.get("extracted_education"),

        extracted_experience=parsed.get("extracted_experience"),

        extracted_projects=parsed.get("extracted_projects"),

        extracted_certifications=parsed.get("extracted_certifications"),

        ats_score=parsed["ats"]["score"],

        contact=parsed["ats"]["contact"],

        sections=parsed["ats"]["sections"],

        suggestions=parsed["ats"]["suggestions"],

        file_path=saved_file_path,

        advice_status="pending",
    )

    db.add(resume)

    # Invalidate Analytics Cache for user upon uploading new resume version
    try:
        db.query(models.AnalyticsCache).filter(models.AnalyticsCache.user_id == current_user.id).delete()
    except Exception as exc:
        logger.warning("Could not invalidate AnalyticsCache: %s", exc)

    db.commit()
    db.refresh(resume)


    # Asynchronously generate AI Career Advice in background
    background_tasks.add_task(_generate_and_store_advice_bg, str(resume.id), str(current_user.id))

    # Respond immediately (<500ms)
    return _serialize_resume_response(resume)


def _generate_and_store_advice_bg(resume_id_str: str, user_id_str: str):
    """
    Background worker that generates AI career advice asynchronously and updates advice_status.
    """
    db: Session = SessionLocal()
    try:
        resume_uuid = uuid.UUID(resume_id_str)
        user_uuid = uuid.UUID(user_id_str)

        resume = db.query(models.Resume).filter(models.Resume.id == resume_uuid).first()
        user = db.query(models.User).filter(models.User.id == user_uuid).first()

        if not resume or not user:
            return

        from app.ai.llm_advisor import get_ai_career_advice
        user_profile_data = {
            "full_name": user.full_name,
            "target_role": user.target_role or "Software Engineer",
            "experience_level": user.experience_level or "Mid-Level",
            "industry": user.industry or "Technology",
            "skills": user.skills or []
        }
        resume_data = {
            "extracted_skills": resume.extracted_skills or [],
            "ats_score": resume.ats_score
        }

        advice = get_ai_career_advice(
            user_profile=user_profile_data,
            resume_data=resume_data
        )

        resume.ai_career_advice = advice
        resume.ai_advice_generated_at = datetime.now(timezone.utc)
        resume.advice_status = "ready"
        db.commit()
    except Exception as exc:
        logger.warning("Background AI advice generation failed for resume %s: %s", resume_id_str, exc)
        db.rollback()
        try:
            resume = db.query(models.Resume).filter(models.Resume.id == uuid.UUID(resume_id_str)).first()
            if resume:
                resume.advice_status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


def _serialize_resume_response(resume: models.Resume) -> dict:
    return {
        "id": resume.id,
        "original_filename": resume.original_filename,
        "raw_text": resume.raw_text,
        "extracted_name": resume.extracted_name,
        "extracted_email": resume.extracted_email,
        "extracted_phone": resume.extracted_phone,
        "extracted_skills": resume.extracted_skills,
        "extracted_education": resume.extracted_education,
        "extracted_experience": resume.extracted_experience,
        "extracted_projects": resume.extracted_projects,
        "extracted_certifications": resume.extracted_certifications,
        "uploaded_at": resume.uploaded_at,
        "ai_career_advice": resume.ai_career_advice,
        "ai_advice_generated_at": resume.ai_advice_generated_at,
        "advice_status": getattr(resume, "advice_status", "pending") or "pending",
        "ats": {
            "score": resume.ats_score,
            "contact": resume.contact,
            "sections": resume.sections,
            "skills": resume.extracted_skills,
            "suggestions": resume.suggestions,
        },
    }


# ======================================================
# List Uploaded Resumes
# ======================================================

@router.get(
    "/my-resumes",
    response_model=list[schemas.ResumeHistoryResponse],
)
def list_my_resumes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    return (
        db.query(models.Resume)
        .filter(models.Resume.user_id == current_user.id)
        .order_by(models.Resume.uploaded_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ======================================================
# Get Single Resume
# ======================================================

@router.get(
    "/{resume_id}",
    response_model=schemas.ResumeResponse,
)
def get_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),  
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find that resume. It may have been deleted.",
        )

    # Recovery logic: if advice_status is pending for > 2 mins (120s), flip to failed
    if getattr(resume, "advice_status", "pending") == "pending" and resume.uploaded_at:
        now_utc = datetime.now(timezone.utc)
        uploaded = resume.uploaded_at
        if uploaded.tzinfo is None:
            uploaded = uploaded.replace(tzinfo=timezone.utc)
        if (now_utc - uploaded).total_seconds() > 120:
            resume.advice_status = "failed"
            db.commit()

    return _serialize_resume_response(resume)


# ======================================================
# Regenerate AI Advice for Resume
# ======================================================

@router.post(
    "/{resume_id}/regenerate-advice",
    response_model=schemas.ResumeResponse,
    status_code=202,
)
def regenerate_resume_advice(
    resume_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find that resume. It may have been deleted.",
        )

    if getattr(resume, "advice_status", "pending") == "pending":
        raise HTTPException(
            status_code=409,
            detail="Advice generation is already in progress.",
        )

    resume.advice_status = "pending"
    resume.ai_career_advice = None
    resume.uploaded_at = datetime.now(timezone.utc)
    db.commit()

    background_tasks.add_task(_generate_and_store_advice_bg, str(resume.id), str(current_user.id))
    return _serialize_resume_response(resume)


# ======================================================
# Delete Resume
# ======================================================

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find that resume. It may have been deleted.",
        )

    # Clean up the physical file from disk to prevent orphaned file leaks
    if getattr(resume, "file_path", None) and os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except OSError as e:
            logger.warning("Could not remove file %s: %s", resume.file_path, e)

    db.delete(resume)
    db.commit()

    return {
        "message": "Resume deleted successfully"
    }


# ======================================================
# Download Resume
# ======================================================

@router.get("/{resume_id}/download")
def download_resume(
    resume_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find that resume. It may have been deleted.",
        )

    if resume.file_path and os.path.exists(resume.file_path):
        media_type = (
            "application/pdf"
            if resume.original_filename.lower().endswith(".pdf")
            else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        return FileResponse(
            path=resume.file_path,
            filename=resume.original_filename,
            media_type=media_type,
        )

    raw_content = resume.raw_text or f"Resume content for {resume.original_filename}"
    return Response(
        content=raw_content.encode("utf-8"),
        media_type="text/plain",
        headers={
            "Content-Disposition": f'attachment; filename="{resume.original_filename}.txt"'
        },
    )


@router.get("/{resume_id}/view")
def view_resume_file(
    resume_id: uuid.UUID,
    token: str = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find that resume. It may have been deleted.",
        )

    if resume.file_path and os.path.exists(resume.file_path):
        media_type = (
            "application/pdf"
            if resume.original_filename.lower().endswith(".pdf")
            else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        return FileResponse(
            path=resume.file_path,
            filename=resume.original_filename,
            media_type=media_type,
            headers={"Content-Disposition": f'inline; filename="{resume.original_filename}"'}
        )

    raw_content = resume.raw_text or f"Resume content for {resume.original_filename}"
    return Response(
        content=raw_content.encode("utf-8"),
        media_type="text/plain",
        headers={
            "Content-Disposition": f'inline; filename="{resume.original_filename}.txt"'
        },
    )


# ======================================================
# Replace Existing Resume
# ======================================================

@router.put(
    "/{resume_id}/replace",
    response_model=schemas.ResumeResponse,
    dependencies=[Depends(rate_limit("resume-upload"))],
)
async def replace_resume(
    resume_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find that resume. It may have been deleted.",
        )

    filename = os.path.basename(file.filename or "")
    if not filename.lower().endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="We currently support PDF and Word (.docx) files. Please upload in one of those formats.",
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
                detail=f"File exceeds maximum allowed size of {settings.max_resume_upload_mb} MB",
            )
        chunks.append(chunk)

    file_bytes = b"".join(chunks)
    if total_size == 0:
        raise HTTPException(
            status_code=400,
            detail="This file appears to be empty. Please check and try again.",
        )

    _sniff_and_validate(filename, file_bytes)

    try:
        parsed = await run_in_threadpool(parse_resume, filename, file_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {str(exc)}")

    upload_dir = os.path.join("static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    saved_file_path = os.path.join(upload_dir, f"{resume.id}_{filename}")

    # Clean up old file to prevent orphaned disk leaks
    old_file_path = getattr(resume, "file_path", None)
    if old_file_path and old_file_path != saved_file_path and os.path.exists(old_file_path):
        try:
            os.remove(old_file_path)
        except OSError as e:
            logger.warning("Could not remove old file %s: %s", old_file_path, e)

    try:
        with open(saved_file_path, "wb") as f:
            f.write(file_bytes)
    except Exception:
        saved_file_path = None

    resume.original_filename = filename
    resume.raw_text = parsed["raw_text"]
    resume.extracted_name = parsed.get("extracted_name")
    resume.extracted_email = parsed["extracted_email"]
    resume.extracted_phone = parsed["extracted_phone"]
    resume.extracted_skills = parsed["extracted_skills"]
    resume.extracted_education = parsed.get("extracted_education")
    resume.extracted_experience = parsed.get("extracted_experience")
    resume.extracted_projects = parsed.get("extracted_projects")
    resume.extracted_certifications = parsed.get("extracted_certifications")
    resume.ats_score = parsed["ats"]["score"]
    resume.contact = parsed["ats"]["contact"]
    resume.sections = parsed["ats"]["sections"]
    resume.suggestions = parsed["ats"]["suggestions"]
    resume.file_path = saved_file_path
    resume.uploaded_at = datetime.now(timezone.utc)
    resume.ai_career_advice = None
    resume.ai_advice_generated_at = None
    resume.advice_status = "pending"

    db.commit()
    db.refresh(resume)

    background_tasks.add_task(_generate_and_store_advice_bg, str(resume.id), str(current_user.id))
    return _serialize_resume_response(resume)


# ======================================================
# JD Matcher Endpoint
# ======================================================

from app.ats.jd_matcher import match_job_description
from app.ats.bullet_enhancer import enhance_bullet_point

@router.post(
    "/match-jd",
    response_model=schemas.JDMatchResponse,
    dependencies=[Depends(rate_limit("match-jd", limit=10, window=60))],
)
async def match_jd_endpoint(
    payload: schemas.JDMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    resume = (
        db.query(models.Resume)
        .filter(
            models.Resume.id == payload.resume_id,
            models.Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    try:
        result = await run_in_threadpool(
            match_job_description,
            resume.raw_text or "",
            resume.extracted_skills or [],
            payload.jd_text
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Job description analysis failed: {str(exc)}")


# ======================================================
# Bullet Enhancer Endpoint
# ======================================================

@router.post(
    "/enhance-bullet",
    response_model=schemas.BulletEnhanceResponse,
    dependencies=[Depends(rate_limit("enhance-bullet", limit=15, window=60))],
)
async def enhance_bullet_endpoint(
    payload: schemas.BulletEnhanceRequest,
    current_user: models.User = Depends(get_current_user),
):
    try:
        result = await run_in_threadpool(enhance_bullet_point, payload.bullet_text)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Bullet enhancement failed: {str(exc)}")


# ======================================================
# Resume Quality & Keyword Optimizer Improvements (Module 6)
# ======================================================

class ResumeImprovementRequest(BaseModel):
    target_role: Optional[str] = None
    resume_id: Optional[str] = None

@router.post(
    "/improvements",
    dependencies=[Depends(rate_limit("resume-upload"))],
)
async def get_resume_improvements(
    payload: Optional[ResumeImprovementRequest] = None,
    resume_id: Optional[str] = Query(None, description="Optional resume ID"),
    target_role: Optional[str] = Query(None, description="Optional target role"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Returns AI-powered resume summary rewrites, missing ATS keyword chips, STAR bullet improvements, and certifications.
    """
    req_role = (payload.target_role if payload and payload.target_role else target_role) or current_user.target_role or "Software Engineer"
    req_resume_id = (payload.resume_id if payload and payload.resume_id else resume_id)

    resume = None
    if req_resume_id:
        try:
            resume_uuid = uuid.UUID(str(req_resume_id))
            resume = db.query(models.Resume).filter(
                models.Resume.id == resume_uuid,
                models.Resume.user_id == current_user.id
            ).first()
        except ValueError:
            pass

    if not resume:
        resume = (
            db.query(models.Resume)
            .filter(models.Resume.user_id == current_user.id)
            .order_by(models.Resume.uploaded_at.desc())
            .first()
        )

    role = req_role
    raw_text = resume.raw_text if resume else ""
    user_skills = (resume.extracted_skills if resume and resume.extracted_skills else current_user.skills) or []

    result = await run_in_threadpool(
        optimize_resume_content,
        resume_text=raw_text,
        target_role=role,
        skills=user_skills
    )

    return result

