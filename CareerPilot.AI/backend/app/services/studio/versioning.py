"""
Studio Versioning Service.
Creates snapshot versions and supports version restoration.
"""

from typing import Dict, List, Any


class StudioVersioningService:

    def create_snapshot(self, resume_obj: Any, action_name: str = "auto-save") -> Dict[str, Any]:
        snapshot = {
            "title": getattr(resume_obj, "title", "Resume"),
            "target_role": getattr(resume_obj, "target_role", ""),
            "full_name": getattr(resume_obj, "full_name", ""),
            "email": getattr(resume_obj, "email", ""),
            "phone": getattr(resume_obj, "phone", ""),
            "summary": getattr(resume_obj, "summary", ""),
            "experiences": [
                {
                    "company": getattr(e, "company", ""),
                    "job_title": getattr(e, "job_title", ""),
                    "start_date": getattr(e, "start_date", ""),
                    "end_date": getattr(e, "end_date", ""),
                    "description": getattr(e, "description", ""),
                    "bullets": getattr(e, "bullets", [])
                }
                for e in getattr(resume_obj, "experiences", [])
            ],
            "skills": [
                {"name": getattr(s, "name", ""), "category": getattr(s, "category", "Technical")}
                for s in getattr(resume_obj, "skills", [])
            ],
            "projects": [
                {"name": getattr(p, "name", ""), "description": getattr(p, "description", ""), "technologies": getattr(p, "technologies", "")}
                for p in getattr(resume_obj, "projects", [])
            ]
        }
        return snapshot
