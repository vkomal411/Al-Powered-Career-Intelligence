"""
Studio Multi-Format Parser Service.
Unified with the canonical app.resume_parser engine.
"""

from typing import Dict, List, Any
import logging
from app.resume_parser import parse_resume

logger = logging.getLogger(__name__)


class StudioParserService:

    def parse_file_bytes(self, file_bytes: bytes, file_ext: str) -> Dict[str, Any]:
        ext = file_ext.lower().strip(".")
        filename = f"resume.{ext}"

        parsed = parse_resume(filename, file_bytes)
        raw_text = parsed.get("raw_text", "")

        contact = {
            "full_name": parsed.get("extracted_name") or "Candidate Name",
            "email": parsed.get("extracted_email") or "",
            "phone": parsed.get("extracted_phone") or "",
            "location": "Remote"
        }

        sections = {
            "summary": parsed.get("summary", "") or "",
            "experience": parsed.get("extracted_experience", []) or [],
            "education": parsed.get("extracted_education", []) or [],
            "projects": parsed.get("extracted_projects", []) or [],
            "skills": parsed.get("extracted_skills", []) or [],
            "certifications": parsed.get("extracted_certifications", []) or [],
        }

        return {
            "raw_text": raw_text,
            "contact": contact,
            "sections": sections,
            "ats": parsed.get("ats", {})
        }
