import logging
from typing import Dict, Any, List, Optional

from app.ai.llm.client import llm_client
from app.ai.career.validator import career_validator
from app.services.skill_normalizer import skill_normalizer

logger = logging.getLogger("career_platform")


class CareerExplainer:
    @staticmethod
    def generate_heuristic_explanation(
        career_title: str,
        category: str,
        match_score: float,
        matching_skills: List[str],
        missing_skills: List[str],
        experience_level: str
    ) -> Dict[str, Any]:
        """Deterministic, highly personalized rule-based explanation fallback."""
        matching_names = [skill_normalizer.get_skill_display_name(s) for s in matching_skills[:4]]
        missing_names = [skill_normalizer.get_skill_display_name(s) for s in missing_skills[:3]]

        matching_str = ", ".join(matching_names) if matching_names else "your current technical background"
        missing_str = ", ".join(missing_names) if missing_names else "advanced architectural best practices"

        why_fit = (
            f"Your background demonstrates strong core competencies in {matching_str}, "
            f"providing a solid foundation for {career_title} positions."
        )

        growth_trajectory = (
            f"Starting as a {experience_level.capitalize()} {career_title}, your clear progression pathway "
            f"leads toward Senior Engineer, Lead Specialist, and Technical Architect roles in {category}."
        )

        steps = [
            f"Master core gaps in {missing_str} through hands-on project implementations.",
            f"Build and deploy a portfolio showcase highlighting scalable {career_title} workflows.",
            f"Tailor your resume bullet points to quantify measurable outcomes achieved with {matching_str}."
        ]

        missing_summary = f"Acquiring {missing_str} will accelerate your interview readiness."

        return {
            "why_fit": why_fit,
            "growth_trajectory": growth_trajectory,
            "recommended_steps": steps,
            "missing_skills_summary": missing_summary
        }

    @classmethod
    def explain_career_match(
        cls,
        career_title: str,
        category: str,
        match_score: float,
        matching_skills: List[str],
        missing_skills: List[str],
        experience_level: str,
        candidate_summary_text: str = ""
    ) -> Dict[str, Any]:
        """
        Generates explanation using LLM if available; falls back cleanly to deterministic heuristic templates.
        """
        matching_names = [skill_normalizer.get_skill_display_name(s) for s in matching_skills[:6]]
        missing_names = [skill_normalizer.get_skill_display_name(s) for s in missing_skills[:5]]

        prompt = f"""
You are an expert AI Career Strategist.
Explain why a candidate with a computed match score of {match_score}% is suitable for the role of "{career_title}" ({category}).

Deterministic Facts (Do NOT contradict these facts):
- Candidate Match Score: {match_score}%
- Candidate Experience Level: {experience_level}
- Matching Skills from Resume: {', '.join(matching_names) if matching_names else 'Foundational technical skills'}
- Missing Required Skills to Learn: {', '.join(missing_names) if missing_names else 'None identified'}

Return ONLY a JSON object with EXACTLY these keys:
- "why_fit": string (2 concise sentences explaining why their specific matching skills fit this career)
- "growth_trajectory": string (1-2 sentences on career progression pathway for this role)
- "recommended_steps": list of 3 actionable, specific milestones to bridge missing skills
- "missing_skills_summary": string (1 sentence explaining the importance of the missing skills)

Return raw JSON only without markdown formatting.
"""
        raw_result = llm_client.generate_json(prompt, timeout_seconds=8)
        validated = career_validator.validate_explanation(raw_result)

        if (
            "why_fit" in validated and
            "growth_trajectory" in validated and
            "recommended_steps" in validated
        ):
            return validated

        # Fallback to heuristic
        return cls.generate_heuristic_explanation(
            career_title=career_title,
            category=category,
            match_score=match_score,
            matching_skills=matching_skills,
            missing_skills=missing_skills,
            experience_level=experience_level
        )


career_explainer = CareerExplainer()
