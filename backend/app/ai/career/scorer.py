from typing import Dict, Any, List, Tuple


class CareerScorer:
    WEIGHT_SKILL = 0.50
    WEIGHT_EXPERIENCE = 0.20
    WEIGHT_EDUCATION = 0.10
    WEIGHT_DOMAIN = 0.10
    WEIGHT_PREFERENCES = 0.10

    @classmethod
    def calculate_score(
        cls,
        skill_score: float,
        experience_score: float,
        education_score: float,
        domain_score: float,
        preference_score: float
    ) -> float:
        """
        Calculates deterministic composite match score (0-100) using the exact documented formula:
        Final = 0.50*Skill + 0.20*Exp + 0.10*Edu + 0.10*Domain + 0.10*Pref
        """
        final_score = (
            cls.WEIGHT_SKILL * skill_score +
            cls.WEIGHT_EXPERIENCE * experience_score +
            cls.WEIGHT_EDUCATION * education_score +
            cls.WEIGHT_DOMAIN * domain_score +
            cls.WEIGHT_PREFERENCES * preference_score
        )
        return round(min(100.0, max(0.0, final_score)), 1)

    @staticmethod
    def get_match_level(score: float) -> str:
        if score >= 80.0:
            return "Strong Fit"
        elif score >= 65.0:
            return "Good Match"
        elif score >= 50.0:
            return "Moderate Potential"
        return "Growth Opportunity"

    @staticmethod
    def calculate_transition_difficulty(missing_skills_count: int, domain_score: float) -> str:
        """
        Calculates transition difficulty:
        - 0 to 2 major gaps = Low
        - 3 to 4 major gaps = Moderate
        - 5+ gaps = High
        - If domain_score < 60, bumps difficulty up one tier.
        """
        if missing_skills_count <= 2:
            base = "Low"
        elif missing_skills_count <= 4:
            base = "Moderate"
        else:
            base = "High"

        if domain_score < 60.0:
            if base == "Low":
                base = "Moderate"
            elif base == "Moderate":
                base = "High"

        return base

    @staticmethod
    def calculate_confidence(candidate_skills_count: int, has_experience: bool) -> float:
        """Calculates system confidence in the recommendation (0.0 to 1.0)."""
        base_confidence = 0.70
        if candidate_skills_count >= 5:
            base_confidence += 0.15
        elif candidate_skills_count >= 2:
            base_confidence += 0.08

        if has_experience:
            base_confidence += 0.10

        return round(min(0.98, base_confidence), 2)


career_scorer = CareerScorer()
