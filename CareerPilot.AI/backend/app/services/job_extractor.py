"""
Job Extractor Service.
Extracts keywords, required skills, experience level, and metadata from job descriptions.
"""

import re
from typing import Dict, List, Any
from collections import Counter


class JobExtractorService:

    COMMON_SKILL_TAXONOMY = [
        "python", "javascript", "typescript", "react", "next.js", "node.js", "sql",
        "postgresql", "docker", "kubernetes", "aws", "git", "figma", "ansible",
        "terraform", "linux", "rest apis", "graphql", "pytorch", "scikit-learn",
        "user research", "wireframing", "design systems", "network security", "burp suite",
        "splunk", "ci/cd", "agile", "scrum", "microservices"
    ]

    def extract_job_info(self, job_description: str) -> Dict[str, Any]:
        text_lower = job_description.lower()

        found_skills = [s.title() for s in self.COMMON_SKILL_TAXONOMY if s in text_lower]

        # Extract experience years required
        exp_match = re.findall(r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)?", text_lower)
        min_years = int(exp_match[0]) if exp_match else 2

        # Extract top keywords
        words = re.findall(r"\b[a-z]{3,}\b", text_lower)
        stopwords = {"the", "and", "for", "with", "this", "that", "you", "are", "have", "will", "our", "team", "work"}
        filtered_words = [w for w in words if w not in stopwords]
        top_keywords = [w for w, _ in Counter(filtered_words).most_common(12)]

        return {
            "required_skills": found_skills or ["TypeScript", "React", "Node.js"],
            "experience_min_years": min_years,
            "top_keywords": top_keywords
        }
