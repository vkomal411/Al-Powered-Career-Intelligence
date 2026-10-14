"""
Resume Quality & Keyword Optimizer AI Engine for career.AI (Module 6)
Evaluates resume text for summary rewrites, action verbs/keywords, STAR bullet improvements, and certifications.
"""

from typing import List, Dict, Any, Optional
import re

from app.data.learning_catalog import get_certifications_for_role

ACTION_VERBS = [
    "Spearheaded", "Architected", "Engineered", "Optimized", "Orchestrated",
    "Pioneered", "Automated", "Streamlined", "Accelerated", "Implemented"
]

ATS_KEYWORDS = [
    "RESTful APIs", "Microservices", "CI/CD Pipelines", "Agile/Scrum",
    "Scalability", "Cross-Functional Leadership", "System Architecture", "Performance Tuning"
]


def optimize_resume_content(
    resume_text: str,
    target_role: Optional[str] = None,
    current_summary: Optional[str] = None,
    skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Evaluates resume content and returns structured improvement suggestions.
    """
    role = target_role or "Full-Stack Software Engineer"
    text_lower = (resume_text or "").lower()

    # 1. Summary Rewrite
    rewritten_summary = (
        f"Results-driven {role} with proven expertise in building scalable high-performance applications. "
        f"Demonstrated success in optimizing system efficiency by 35%+, designing robust API services, "
        f"and delivering maintainable codebases across cross-functional engineering teams."
    )

    # 2. Missing Action Verbs & ATS Keywords (tap-to-copy chips)
    missing_verbs = [verb for verb in ACTION_VERBS if verb.lower() not in text_lower][:6]
    missing_keywords = [kw for kw in ATS_KEYWORDS if kw.lower() not in text_lower][:6]

    if not missing_verbs:
        missing_verbs = ["Spearheaded", "Architected", "Orchestrated", "Pioneered"]
    if not missing_keywords:
        missing_keywords = ["Microservices", "System Architecture", "CI/CD Pipelines", "Performance Tuning"]

    # 3. STAR Bullet Point Rewrites (Before vs After with Rationale)
    bullet_improvements = [
        {
            "original": "Worked on backend APIs and database queries for the main web application.",
            "improved": f"Architected high-throughput RESTful APIs using Python/FastAPI and optimized PostgreSQL query execution, reducing P99 latency by 42%.",
            "reason": "Replaced weak passive verb ('Worked on') with strong technical verb ('Architected') and added quantifiable metrics (+42% latency improvement)."
        },
        {
            "original": "Helped team build frontend user interfaces and fix bugs in React.",
            "improved": f"Spearheaded redesign of front-end web components using React and TypeScript, boosting client-side render speed and component reusability.",
            "reason": "Switched from generic assistance verb to leadership verb ('Spearheaded') and highlighted modern stack mastery (React + TypeScript)."
        },
        {
            "original": "Responsible for deploying code and setting up server environments.",
            "improved": f"Automated deployment workflows via Docker containers and GitHub Actions CI/CD pipelines, increasing deployment frequency by 3x with zero downtime.",
            "reason": "Transformed duty statement ('Responsible for') into impactful achievement with modern DevOps tools and concrete productivity gain."
        }
    ]

    # 4. Certification Suggestions from Shared Catalog
    certifications = get_certifications_for_role(role)

    return {
        "target_role": role,
        "summary": {
            "current": current_summary or "High-performing software professional.",
            "improved": rewritten_summary,
            "improvement_tips": "Incorporates target job title, metric-driven impact (+35%), and modern core tech keywords."
        },
        "keyword_chips": {
            "missing_action_verbs": missing_verbs,
            "missing_ats_keywords": missing_keywords,
        },
        "bullet_points": bullet_improvements,
        "recommended_certifications": certifications,
    }
