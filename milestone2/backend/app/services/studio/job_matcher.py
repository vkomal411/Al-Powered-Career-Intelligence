"""
Studio Job Matcher & Keyword Heatmap Service.
Analyses job posting text, generates visual keyword density heatmaps, and calculates match scores.
"""

import re
from typing import Dict, List, Any
from collections import Counter


class StudioJobMatcherService:

    COMMON_TECH_TAXONOMY = [
        "python", "javascript", "typescript", "react", "next.js", "node.js", "sql",
        "postgresql", "docker", "kubernetes", "aws", "git", "figma", "ansible",
        "terraform", "linux", "rest apis", "graphql", "pytorch", "scikit-learn",
        "user research", "wireframing", "design systems", "network security", "burp suite",
        "splunk", "ci/cd", "agile", "scrum", "microservices"
    ]

    def match_resume_to_job(self, resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
        text_lower = job_description.lower()

        # Extract keyword frequencies for Heatmap
        words = re.findall(r"\b[a-z]{3,}\b", text_lower)
        stopwords = {"the", "and", "for", "with", "this", "that", "you", "are", "have", "will", "our", "team", "work", "must"}
        filtered = [w for w in words if w not in stopwords]
        keyword_counts = dict(Counter(filtered).most_common(15))

        # Skill matching
        candidate_skills = set(
            s["name"].lower() if isinstance(s, dict) else str(s).lower()
            for s in resume_data.get("skills", [])
        )
        job_required_skills = set(s for s in self.COMMON_TECH_TAXONOMY if s in text_lower)

        if not job_required_skills:
            job_required_skills = {"figma", "user research", "wireframing", "react", "typescript"}

        matched = [s.title() for s in candidate_skills.intersection(job_required_skills)]
        missing = [s.title() for s in job_required_skills.difference(candidate_skills)]

        if job_required_skills:
            match_score = (len(matched) / len(job_required_skills)) * 100
        else:
            match_score = 75.0

        match_score = round(min(98.0, max(45.0, match_score)), 1)

        suggestions = []
        if missing:
            suggestions.append(f"Incorporate missing target skills: {', '.join(missing[:4])}.")
        if matched:
            suggestions.append(f"Verified matched competencies: {', '.join(matched[:3])}.")

        return {
            "match_score": match_score,
            "keyword_heatmap": keyword_counts,
            "matched_skills": matched,
            "missing_skills": missing,
            "suggestions": suggestions
        }
