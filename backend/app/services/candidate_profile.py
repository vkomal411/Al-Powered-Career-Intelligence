import re
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

from app import models
from app.services.skill_normalizer import skill_normalizer


@dataclass
class CandidateProfile:
    skills: List[str] = field(default_factory=list)
    normalized_skills: List[str] = field(default_factory=list)
    experience_years: float = 0.0
    experience_level: str = "entry"  # entry, mid, senior
    education: List[Dict[str, Any]] = field(default_factory=list)
    education_level: str = "bachelor"  # bachelor, master, phd, diploma, none
    job_titles: List[str] = field(default_factory=list)
    domains: List[str] = field(default_factory=list)
    certifications: List[str] = field(default_factory=list)
    projects: List[Dict[str, Any]] = field(default_factory=list)
    technologies: List[str] = field(default_factory=list)
    raw_text: str = ""


class CandidateProfileBuilder:
    @staticmethod
    def infer_experience_years(raw_text: str, experience_entries: Optional[List[Any]] = None) -> float:
        """Heuristically estimates years of experience from experience entries or text."""
        total_years = 0.0
        if experience_entries and isinstance(experience_entries, list):
            # Count distinct job/experience entries as ~1.5 years average if dates not parsed
            total_years = min(15.0, max(0.5, len(experience_entries) * 1.5))
        
        # Regex search for year patterns e.g. "3+ years", "5 years of experience"
        match = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years|yrs)\s+(?:of\s+)?experience", raw_text, re.IGNORECASE)
        if match:
            try:
                parsed_val = float(match.group(1))
                if 0 < parsed_val <= 35:
                    total_years = max(total_years, parsed_val)
            except ValueError:
                pass

        return round(total_years, 1)

    @staticmethod
    def map_experience_level(years: float, explicit_level: Optional[str] = None) -> str:
        if explicit_level and explicit_level.lower() in {"entry", "mid", "senior"}:
            return explicit_level.lower()
        if years < 2.0:
            return "entry"
        elif years < 5.0:
            return "mid"
        return "senior"

    @staticmethod
    def infer_education_level(education_entries: Optional[List[Any]], raw_text: str) -> str:
        text_lower = (raw_text or "").lower()
        if "ph.d" in text_lower or "phd" in text_lower or "doctorate" in text_lower:
            return "phd"
        if "master" in text_lower or "m.tech" in text_lower or "m.s." in text_lower or "mba" in text_lower or "mca" in text_lower:
            return "master"
        if "bachelor" in text_lower or "b.tech" in text_lower or "b.e." in text_lower or "b.s." in text_lower or "bca" in text_lower:
            return "bachelor"
        if "diploma" in text_lower or "associate" in text_lower:
            return "diploma"
        return "bachelor"

    @staticmethod
    def infer_domains(skills: List[str], raw_text: str) -> List[str]:
        domains = set()
        text_lower = (raw_text or "").lower()

        domain_keywords = {
            "software": ["software", "developer", "engineering", "programming", "code"],
            "backend": ["backend", "api", "database", "server", "microservices", "sql"],
            "frontend": ["frontend", "ui", "ux", "web", "react", "html", "css"],
            "cloud": ["cloud", "aws", "azure", "gcp", "devops", "kubernetes", "docker"],
            "data": ["data", "etl", "analytics", "sql", "warehouse", "pipeline"],
            "ai": ["ai", "machine learning", "deep learning", "nlp", "llm", "neural"],
            "security": ["security", "cybersecurity", "soc", "penetration", "vulnerability", "auth"],
            "qa": ["qa", "testing", "selenium", "automation", "test"],
            "product": ["product", "agile", "scrum", "roadmap", "stakeholder", "management"],
            "mobile": ["mobile", "android", "ios", "react native", "flutter", "swift"]
        }

        for domain, keywords in domain_keywords.items():
            if any(k in text_lower for k in keywords) or any(k in skills for k in keywords):
                domains.add(domain)

        if not domains:
            domains.add("software")

        return sorted(list(domains))

    @classmethod
    def from_resume_and_user(
        cls,
        resume: Optional[models.Resume],
        user: Optional[models.User],
        raw_text_override: Optional[str] = None
    ) -> CandidateProfile:
        raw_text = ""
        raw_skills: List[str] = []
        experience_entries: List[Any] = []
        education_entries: List[Any] = []
        certifications_entries: List[Any] = []
        projects_entries: List[Any] = []
        job_titles: List[str] = []

        if user:
            if user.skills and isinstance(user.skills, list):
                raw_skills.extend(user.skills)
            if user.target_role:
                job_titles.append(user.target_role)
            if user.education and isinstance(user.education, list):
                education_entries.extend(user.education)
            if user.certifications and isinstance(user.certifications, list):
                certifications_entries.extend(user.certifications)
            if user.projects and isinstance(user.projects, list):
                projects_entries.extend(user.projects)

        if resume:
            raw_text = resume.raw_text or ""
            if resume.extracted_skills and isinstance(resume.extracted_skills, list):
                raw_skills.extend(resume.extracted_skills)
            if resume.extracted_education and isinstance(resume.extracted_education, list):
                education_entries.extend(resume.extracted_education)
            if resume.extracted_experience and isinstance(resume.extracted_experience, list):
                experience_entries.extend(resume.extracted_experience)
            if resume.extracted_certifications and isinstance(resume.extracted_certifications, list):
                certifications_entries.extend(resume.extracted_certifications)
            if resume.extracted_projects and isinstance(resume.extracted_projects, list):
                projects_entries.extend(resume.extracted_projects)

        if raw_text_override:
            raw_text = f"{raw_text}\n{raw_text_override}"

        # Normalize skills
        normalized = skill_normalizer.normalize_skills(raw_skills)

        # Experience calculation
        exp_years = cls.infer_experience_years(raw_text, experience_entries)
        exp_level = cls.map_experience_level(exp_years, user.experience_level if user else None)
        edu_level = cls.infer_education_level(education_entries, raw_text)
        domains = cls.infer_domains(normalized, raw_text)

        return CandidateProfile(
            skills=raw_skills,
            normalized_skills=normalized,
            experience_years=exp_years,
            experience_level=exp_level,
            education=education_entries,
            education_level=edu_level,
            job_titles=job_titles,
            domains=domains,
            certifications=[str(c) for c in certifications_entries],
            projects=projects_entries,
            technologies=normalized,
            raw_text=raw_text
        )
