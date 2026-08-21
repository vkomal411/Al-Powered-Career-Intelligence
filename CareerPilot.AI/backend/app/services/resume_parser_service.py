"""
Resume Parser Service for multi-format file ingestion (PDF, DOCX, TXT).
Unified with the canonical app.resume_parser engine.
"""

from typing import Dict, List, Any
import logging
from app.resume_parser import parse_resume

logger = logging.getLogger(__name__)


class ResumeParserService:

    def parse_file_content(self, file_bytes: bytes, file_ext: str) -> Dict[str, Any]:
        file_ext = file_ext.lower().strip(".")
        filename = f"resume.{file_ext}"

        parsed = parse_resume(filename, file_bytes)
        raw_text = parsed.get("raw_text", "")

        sections = {
            "summary": parsed.get("summary", "") or "",
            "experience": parsed.get("extracted_experience", []) or [],
            "education": parsed.get("extracted_education", []) or [],
            "skills": parsed.get("extracted_skills", []) or [],
            "projects": parsed.get("extracted_projects", []) or [],
            "certifications": parsed.get("extracted_certifications", []) or [],
        }
        entities = {
            "name": parsed.get("extracted_name") or "Candidate",
            "email": parsed.get("extracted_email") or "",
            "phone": parsed.get("extracted_phone") or "",
            "skills": parsed.get("extracted_skills", []) or []
        }

        return {
            "raw_text": raw_text,
            "sections": sections,
            "entities": entities,
            "ats": parsed.get("ats", {})
        }
