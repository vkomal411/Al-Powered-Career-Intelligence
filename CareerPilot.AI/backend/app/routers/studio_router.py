"""
FastAPI Router for CareerPilot AI Resume Studio v2.0.
Exposes modular studio endpoints for resumes, upload, AI assistant, ATS 7-category scoring, job match heatmaps, and exports.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import uuid

from app.database import get_db
from app.auth_utils import get_current_user
from app.models import (
    StudioResume,
    StudioExperience,
    StudioEducation,
    StudioProjects,
    StudioSkills,
    StudioATSAnalysis,
    StudioJobMatch,
    StudioResumeVersion
)
from app.schemas import (
    StudioResumeCreate,
    StudioResumeDTO,
    StudioAIRewriteRequest,
    StudioAIRewriteResponse,
    StudioATSScoreResponse,
    StudioJobMatchRequest,
    StudioJobMatchResponse
)
from app.services.studio.parser import StudioParserService
from app.services.studio.ats_engine import StudioATSEngineService
from app.services.studio.job_matcher import StudioJobMatcherService
from app.services.studio.ai_assistant import StudioAIAssistantService
from app.services.studio.exporter import StudioExporterService
from app.services.studio.versioning import StudioVersioningService

router = APIRouter(prefix="/api/studio", tags=["Resume Studio v2.0"])

parser_service = StudioParserService()
ats_service = StudioATSEngineService()
job_matcher_service = StudioJobMatcherService()
ai_service = StudioAIAssistantService()
exporter_service = StudioExporterService()
versioning_service = StudioVersioningService()


@router.post("/resumes")
async def create_studio_resume(
    req: StudioResumeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new Studio Resume Aggregate"""
    resume = StudioResume(
        user_id=current_user.id,
        title=req.title,
        target_role=req.target_role,
        template_id=req.template_id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone="+1 (555) 234-5678"
    )
    db.add(resume)
    db.flush()

    # Pre-populate initial skills
    initial_skills = ["Figma", "User Research", "Wireframing", "Design Systems"]
    for idx, s in enumerate(initial_skills):
        db.add(StudioSkills(resume_id=resume.id, name=s, category="Technical", order_index=idx))

    # Pre-populate initial experience
    db.add(StudioExperience(
        resume_id=resume.id,
        company="Apex Design Studios",
        job_title=req.target_role,
        start_date="2022",
        end_date="Present",
        description=f"Spearheaded end-to-end user experience redesign for {req.target_role} initiatives; increased product retention by 35%.",
        bullets=[f"Established a unified Figma component design system for {req.target_role} projects."]
    ))

    # Pre-populate initial project
    db.add(StudioProjects(
        resume_id=resume.id,
        name="Interactive SaaS Product Redesign",
        description="Conducted 20+ usability testing sessions and designed responsive wireframes, reducing onboarding friction by 28%.",
        technologies="Figma, User Research, Wireframing, React"
    ))

    db.commit()
    db.refresh(resume)

    return {
        "id": str(resume.id),
        "title": resume.title,
        "target_role": resume.target_role,
        "status": resume.status
    }


@router.get("/resumes")
async def list_studio_resumes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List all Studio Resumes belonging to user"""
    resumes = db.query(StudioResume).filter(StudioResume.user_id == current_user.id).all()
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "target_role": r.target_role,
            "template_id": r.template_id,
            "status": r.status,
            "updated_at": r.updated_at
        }
        for r in resumes
    ]


@router.get("/resumes/{resume_id}")
async def get_studio_resume_detail(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get full details of a Studio Resume aggregate"""
    try:
        r_uuid = uuid.UUID(resume_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    resume = db.query(StudioResume).filter(
        StudioResume.id == r_uuid,
        StudioResume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Studio Resume not found")

    return {
        "id": str(resume.id),
        "title": resume.title,
        "target_role": resume.target_role,
        "template_id": resume.template_id,
        "full_name": resume.full_name or current_user.full_name,
        "email": resume.email or current_user.email,
        "phone": resume.phone or "",
        "summary": resume.summary or f"Creative and user-centered {resume.target_role} with extensive experience.",
        "experiences": [
            {
                "id": str(e.id),
                "company": e.company,
                "job_title": e.job_title,
                "start_date": e.start_date,
                "end_date": e.end_date,
                "description": e.description,
                "bullets": e.bullets or []
            }
            for e in resume.experiences
        ],
        "projects": [
            {
                "id": str(p.id),
                "name": p.name,
                "description": p.description,
                "technologies": p.technologies
            }
            for p in resume.projects
        ],
        "skills": [s.name for s in resume.skills]
    }


@router.post("/upload")
async def import_resume_file(
    file: UploadFile = File(...),
    target_role: str = "UI/UX Designer",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Import and parse resume file (PDF, DOCX, TXT)"""
    contents = await file.read()
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "txt"

    parsed = parser_service.parse_file_bytes(contents, file_ext)
    contact = parsed.get("contact", {})
    title_clean = file.filename.rsplit(".", 1)[0] if file.filename else "Imported Resume"

    resume = StudioResume(
        user_id=current_user.id,
        title=title_clean,
        target_role=target_role,
        full_name=contact.get("full_name", current_user.full_name),
        email=contact.get("email", current_user.email),
        phone=contact.get("phone", ""),
        summary=parsed.get("sections", {}).get("summary", "")
    )
    db.add(resume)
    db.flush()

    db.commit()
    return {
        "id": str(resume.id),
        "title": resume.title,
        "target_role": resume.target_role,
        "status": "imported"
    }


@router.post("/ai/improve-summary")
async def improve_summary(
    req: StudioAIRewriteRequest
):
    """AI Summary Generator endpoint with tone switching"""
    summary = ai_service.generate_summary(target_role=req.target_role, tone=req.tone)
    return {"summary": summary, "tone": req.tone}


@router.post("/ai/rewrite-experience")
async def rewrite_experience(
    req: StudioAIRewriteRequest
):
    """AI STAR Bullet point rewriter with tone switching"""
    res = ai_service.rewrite_bullet(original_bullet=req.text, target_role=req.target_role, tone=req.tone)
    return res


@router.post("/ats/score")
async def calculate_ats_score(
    resume_data: dict
):
    """7-Category ATS Scoring Audit Endpoint"""
    audit = ats_service.analyze_resume(resume_data)
    return audit


@router.post("/job-match")
async def match_job_posting(
    req: StudioJobMatchRequest,
    resume_data: dict
):
    """Match resume against job posting description with keyword heatmap"""
    match_res = job_matcher_service.match_resume_to_job(resume_data, req.job_description)
    return match_res


@router.get("/export/docx")
async def export_docx(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Export Studio Resume as Word (.docx) file"""
    try:
        r_uuid = uuid.UUID(resume_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    resume = db.query(StudioResume).filter(
        StudioResume.id == r_uuid,
        StudioResume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Studio Resume not found")

    data = {
        "full_name": resume.full_name or current_user.full_name,
        "target_role": resume.target_role,
        "email": resume.email or current_user.email,
        "phone": resume.phone or "",
        "summary": resume.summary or "",
        "skills": [s.name for s in resume.skills],
        "experiences": [
            {"job_title": e.job_title, "company": e.company, "start_date": e.start_date, "end_date": e.end_date, "description": e.description, "bullets": e.bullets or []}
            for e in resume.experiences
        ],
        "projects": [
            {"name": p.name, "description": p.description, "technologies": p.technologies}
            for p in resume.projects
        ]
    }

    docx_bytes = exporter_service.export_docx(data)
    return StreamingResponse(
        io.BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={resume.title.replace(' ', '_')}.docx"}
    )


@router.post("/export/docx")
async def export_editor_docx(resume_data: dict):
    """Export the currently edited builder data as a real DOCX file."""
    docx_bytes = exporter_service.export_docx(resume_data)
    filename = str(resume_data.get("full_name", "resume")).strip().replace(" ", "_") or "resume"
    return StreamingResponse(io.BytesIO(docx_bytes), media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename={filename}_Resume.docx"})


@router.post("/export/pdf")
async def export_editor_pdf(resume_data: dict):
    """Export the currently edited builder data as a real PDF file."""
    pdf_bytes = exporter_service.export_pdf(resume_data)
    filename = str(resume_data.get("full_name", "resume")).strip().replace(" ", "_") or "resume"
    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}_Resume.pdf"})


@router.get("/export/txt")
async def export_txt(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Export Studio Resume as plain text file"""
    try:
        r_uuid = uuid.UUID(resume_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")

    resume = db.query(StudioResume).filter(
        StudioResume.id == r_uuid,
        StudioResume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Studio Resume not found")

    data = {
        "full_name": resume.full_name or current_user.full_name,
        "target_role": resume.target_role,
        "email": resume.email or current_user.email,
        "phone": resume.phone or "",
        "summary": resume.summary or "",
        "skills": [s.name for s in resume.skills],
        "experiences": [
            {"job_title": e.job_title, "company": e.company, "start_date": e.start_date, "end_date": e.end_date, "description": e.description}
            for e in resume.experiences
        ]
    }

    txt_str = exporter_service.export_txt(data)
    return Response(
        content=txt_str,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={resume.title.replace(' ', '_')}.txt"}
    )
