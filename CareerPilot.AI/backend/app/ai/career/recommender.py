import json
import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.services.candidate_profile import CandidateProfile
from app.services.skill_normalizer import skill_normalizer
from app.services.market_data import market_data_service
from app.ai.career.matcher import career_matcher
from app.ai.career.scorer import career_scorer
from app.ai.career.explainer import career_explainer

logger = logging.getLogger("career_platform")

CAREERS_DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "careers.json"
)


class CareerRecommenderEngine:
    ENGINE_VERSION = "career-v1"

    def __init__(self):
        self.careers: List[Dict[str, Any]] = []
        self._load_careers()

    def _load_careers(self):
        try:
            if os.path.exists(CAREERS_DATA_PATH):
                with open(CAREERS_DATA_PATH, "r", encoding="utf-8") as f:
                    self.careers = json.load(f)
        except Exception as e:
            logger.error("Failed to load careers catalog from %s: %s", CAREERS_DATA_PATH, e)
            self.careers = []

    def recommend(
        self,
        candidate: CandidateProfile,
        preferences: Optional[Dict[str, Any]] = None,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Executes the deterministic matching & scoring pipeline across the career catalog.
        Returns top ranked careers, alternative paths, summary, and metadata.
        """
        evaluated_careers: List[Dict[str, Any]] = []

        for career in self.careers:
            career_id = career["id"]
            career_title = career["title"]
            category = career["category"]
            description = career.get("description", "")
            required_skills = career.get("required_skills", {})
            optional_skills = career.get("optional_skills", {})
            min_years = career.get("preferred_experience", {}).get("min_years", 0)
            allowed_edus = career.get("education_levels", ["any"])
            career_domains = career.get("domains", [])

            # 1. Component matches
            skill_score, matching_skills, missing_skills = career_matcher.match_skills(
                candidate_skills=candidate.normalized_skills,
                required_skills=required_skills,
                optional_skills=optional_skills
            )

            exp_score = career_matcher.match_experience(
                candidate_years=candidate.experience_years,
                preferred_min_years=min_years
            )

            edu_score = career_matcher.match_education(
                candidate_edu=candidate.education_level,
                allowed_edus=allowed_edus
            )

            domain_score = career_matcher.match_domain(
                candidate_domains=candidate.domains,
                career_domains=career_domains
            )

            pref_score = career_matcher.match_preferences(
                career_data=career,
                preferences=preferences
            )

            # 2. Composite deterministic score
            final_score = career_scorer.calculate_score(
                skill_score=skill_score,
                experience_score=exp_score,
                education_score=edu_score,
                domain_score=domain_score,
                preference_score=pref_score
            )

            match_level = career_scorer.get_match_level(final_score)
            transition_diff = career_scorer.calculate_transition_difficulty(
                missing_skills_count=len(missing_skills),
                domain_score=domain_score
            )

            # 3. Market data lookup
            market_info = market_data_service.get_market_info(
                career_id=career_id,
                experience_level=candidate.experience_level
            )

            confidence = career_scorer.calculate_confidence(
                candidate_skills_count=len(candidate.normalized_skills),
                has_experience=candidate.experience_years > 0
            )

            evaluated_careers.append({
                "career_id": career_id,
                "career_title": career_title,
                "category": category,
                "description": description,
                "match_score": final_score,
                "match_level": match_level,
                "matching_skills": matching_skills,
                "matching_skills_display": [skill_normalizer.get_skill_display_name(s) for s in matching_skills],
                "missing_skills": missing_skills,
                "missing_skills_display": [skill_normalizer.get_skill_display_name(s) for s in missing_skills],
                "transition_difficulty": transition_diff,
                "market_info": market_info,
                "confidence": confidence,
                "component_scores": {
                    "skill": skill_score,
                    "experience": exp_score,
                    "education": edu_score,
                    "domain": domain_score,
                    "preferences": pref_score
                }
            })

        # Sort descending by match_score
        evaluated_careers.sort(key=lambda x: x["match_score"], reverse=True)

        top_candidates = evaluated_careers[:top_k]
        top_ids = {c["career_id"] for c in top_candidates}
        top_score = top_candidates[0]["match_score"] if top_candidates else 0.0

        # Select 2-3 alternative paths (within 10-18 points of top or from adjacent category)
        alternatives = [
            c for c in evaluated_careers[top_k:]
            if c["career_id"] not in top_ids and (top_score - c["match_score"]) <= 25.0
        ][:3]

        # Enrich top candidates with LLM/heuristic explanations
        for item in top_candidates:
            exp_data = career_explainer.explain_career_match(
                career_title=item["career_title"],
                category=item["category"],
                match_score=item["match_score"],
                matching_skills=item["matching_skills"],
                missing_skills=item["missing_skills"],
                experience_level=candidate.experience_level
            )
            item.update(exp_data)

        for item in alternatives:
            exp_data = career_explainer.generate_heuristic_explanation(
                career_title=item["career_title"],
                category=item["category"],
                match_score=item["match_score"],
                matching_skills=item["matching_skills"],
                missing_skills=item["missing_skills"],
                experience_level=candidate.experience_level
            )
            item.update(exp_data)

        # Generate overarching summary & candidate strengths
        top_skills_display = [
            skill_normalizer.get_skill_display_name(s)
            for s in candidate.normalized_skills[:5]
        ]
        skills_str = ", ".join(top_skills_display) if top_skills_display else "technical foundations"
        best_role = top_candidates[0]["career_title"] if top_candidates else "Software Engineering"

        summary = (
            f"Based on your resume analysis and core proficiencies in {skills_str}, "
            f"your profile aligns most strongly with {best_role} and related pathways. "
            f"Targeting key skill gaps will further expand your market readiness."
        )

        candidate_strengths = [
            f"Demonstrated technical competencies in {skills_str}.",
            f"{candidate.experience_level.capitalize()} level profile with practical project and domain alignment.",
            f"Strong potential across multiple high-demand {top_candidates[0]['category'] if top_candidates else 'Technology'} roles."
        ]

        # Suggested certifications
        recommended_certifications = [
            "AWS Certified Developer / Solutions Architect Associate",
            "Google Professional Cloud Developer",
            "Certified Kubernetes Application Developer (CKAD)",
            "HashiCorp Certified: Terraform Associate"
        ]

        return {
            "summary": summary,
            "candidate_strengths": candidate_strengths,
            "top_career_paths": top_candidates,
            "alternative_paths": alternatives,
            "recommended_certifications": recommended_certifications,
            "engine_version": self.ENGINE_VERSION,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "evaluated_count": len(evaluated_careers)
        }


# Singleton engine instance
career_recommender = CareerRecommenderEngine()
