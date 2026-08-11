import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.auth_utils import get_current_user
from app.rate_limit import rate_limit
from app.ats.jd_matcher import compute_keyword_overlap

router = APIRouter(prefix="/resume", tags=["AI Resume Tailor"])


class TailorRequest(BaseModel):
    job_description: str = Field(..., min_length=20, max_length=10000)


class BulletSuggestion(BaseModel):
    bullet_id: str
    original: str
    suggested: str
    reason: str


class TailorResponse(BaseModel):
    overlap: dict
    suggestions: list[BulletSuggestion]


@router.post(
    "/{resume_id}/tailor",
    response_model=TailorResponse,
    dependencies=[Depends(rate_limit("tailor-resume"))],
)
def tailor_resume_to_jd(
    resume_id: uuid.UUID,
    payload: TailorRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Analyzes resume against a target Job Description.
    Step 1: Computes deterministic keyword overlap (<50ms).
    Step 2: Generates non-destructive bullet point rewrite suggestions.
    """
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
            detail="Resume not found.",
        )

    # Step 1: Deterministic keyword overlap
    overlap = compute_keyword_overlap(resume.raw_text or "", payload.job_description)

    # Step 2: Generate bullet point rewrite suggestions
    suggestions = []
    
    # Extract bullets from raw text lines
    lines = [line.strip("-•* ").strip() for line in (resume.raw_text or "").split("\n") if len(line.strip()) > 15]
    
    missing_keywords = overlap.get("missing", [])[:5]
    
    for idx, line in enumerate(lines[:4]):
        bullet_id = f"bullet_{idx + 1}"
        if missing_keywords and idx < len(missing_keywords):
            kw = missing_keywords[idx]
            suggested = f"{line} (demonstrating expertise in {kw})"
            reason = f"Incorporates missing target keyword '{kw}' found in job description."
        else:
            suggested = f"Spearheaded {line.lower()} to drive measurable impact."
            reason = "Emphasizes action verbs and quantifiable results."
            
        suggestions.append(
            BulletSuggestion(
                bullet_id=bullet_id,
                original=line,
                suggested=suggested,
                reason=reason,
            )
        )

    return TailorResponse(
        overlap=overlap,
        suggestions=suggestions,
    )
