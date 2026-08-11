"""
Job Matcher Service.
Compares candidate resume against job requirements to produce fit match %, missing skills, and suggestions.
"""

from typing import Dict, List, Any


class JobMatcherService:

    def match_resume_to_job(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        candidate_skills = set(s.lower() for s in resume_data.get("skills", []))
        required_skills = set(s.lower() for s in job_data.get("required_skills", []))

        matched_skills = [s.title() for s in candidate_skills.intersection(required_skills)]
        missing_skills = [s.title() for s in required_skills.difference(candidate_skills)]

        if required_skills:
            match_score = (len(matched_skills) / len(required_skills)) * 100
        else:
            match_score = 75.0

        match_score = round(min(98.0, max(40.0, match_score)), 1)

        suggestions = []
        if missing_skills:
            suggestions.append(f"Add missing required skill keywords to your resume: {', '.join(missing_skills[:4])}.")
        if matched_skills:
            suggestions.append(f"Emphasize these verified matched skills in your top summary: {', '.join(matched_skills[:3])}.")

        top_keywords = job_data.get("top_keywords", [])
        if top_keywords:
            suggestions.append(f"Incorporate key job posting terms: {', '.join(top_keywords[:4])}.")

        return {
            "match_score": match_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "suggestions": suggestions,
            "experience_match": True
        }
