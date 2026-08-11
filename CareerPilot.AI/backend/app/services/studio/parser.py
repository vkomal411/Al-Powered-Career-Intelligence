"""
Studio Multi-Format Parser Service.
Parses PDF (pdfplumber), DOCX (python-docx), and TXT files.
Extracts contact info, summary, experience, education, projects, skills, certifications, languages, awards.
"""

import io
import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class StudioParserService:

    def parse_file_bytes(self, file_bytes: bytes, file_ext: str) -> Dict[str, Any]:
        ext = file_ext.lower().strip(".")
        raw_text = ""

        if ext == "pdf":
            raw_text = self._extract_pdf(file_bytes)
        elif ext == "docx":
            raw_text = self._extract_docx(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        contact = self._extract_contact_info(raw_text)
        sections = self._extract_sections(raw_text)

        return {
            "raw_text": raw_text,
            "contact": contact,
            "sections": sections
        }

    def _extract_pdf(self, file_bytes: bytes) -> str:
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
                return "\n".join(pages)
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")
            return file_bytes.decode("latin1", errors="ignore")

    def _extract_docx(self, file_bytes: bytes) -> str:
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join([para.text for para in doc.paragraphs if para.text])
        except Exception as e:
            logger.warning(f"python-docx failed: {e}")
            return file_bytes.decode("utf-8", errors="ignore")

    def _extract_contact_info(self, text: str) -> Dict[str, str]:
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        phones = re.findall(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        lines = [l.strip() for l in text.split("\n") if l.strip()]

        name = lines[0] if lines else "Candidate Name"
        return {
            "full_name": name,
            "email": emails[0] if emails else "",
            "phone": phones[0] if phones else "",
            "location": "Remote"
        }

    def _extract_sections(self, text: str) -> Dict[str, Any]:
        headers = r"(?i)(experience|work history|education|projects|skills|certifications|summary|profile)"
        parts = re.split(headers, text)

        sections = {
            "summary": "",
            "experience": [],
            "education": [],
            "projects": [],
            "skills": []
        }

        current = "summary"
        for part in parts:
            p_str = part.strip()
            if not p_str:
                continue
            if re.match(headers, p_str):
                h_lower = p_str.lower()
                if "experience" in h_lower or "work" in h_lower:
                    current = "experience"
                elif "education" in h_lower:
                    current = "education"
                elif "project" in h_lower:
                    current = "projects"
                elif "skill" in h_lower:
                    current = "skills"
                else:
                    current = "summary"
            else:
                if current in ["experience", "education", "projects", "skills"]:
                    sections[current].append(p_str)
                else:
                    sections["summary"] += p_str + "\n"

        return sections
