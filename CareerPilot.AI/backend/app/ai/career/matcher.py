from typing import Dict, Any, List, Set, Tuple, Optional
from app.services.candidate_profile import CandidateProfile
from app.services.skill_normalizer import skill_normalizer


class CareerMatcher:
    @staticmethod
    def match_skills(
        candidate_skills: List[str],
        required_skills: Dict[str, float],
        optional_skills: Dict[str, float]
    ) -> Tuple[float, List[str], List[str]]:
        """
        Computes weighted skill match score (0-100), matching skill IDs, and missing required skill IDs.
        """
        candidate_set: Set[str] = set(candidate_skills)
        matched_required: List[str] = []
        missing_required: List[str] = []
        matched_optional: List[str] = []

        total_req_weight = sum(required_skills.values()) if required_skills else 1.0
        earned_req_weight = 0.0

        for skill, weight in required_skills.items():
            if skill in candidate_set:
                matched_required.append(skill)
                earned_req_weight += weight
            else:
                missing_required.append(skill)

        total_opt_weight = sum(optional_skills.values()) if optional_skills else 1.0
        earned_opt_weight = 0.0

        for skill, weight in optional_skills.items():
            if skill in candidate_set:
                matched_optional.append(skill)
                earned_opt_weight += weight

        req_score = (earned_req_weight / total_req_weight) * 80.0 if total_req_weight > 0 else 0.0
        opt_score = (earned_opt_weight / total_opt_weight) * 20.0 if total_opt_weight > 0 else 0.0
        skill_score = min(100.0, max(0.0, req_score + opt_score))

        all_matching = matched_required + [s for s in matched_optional if s not in matched_required]
        return round(skill_score, 1), all_matching, missing_required

    @staticmethod
    def match_experience(candidate_years: float, preferred_min_years: int) -> float:
        """Computes experience match score (0-100)."""
        if preferred_min_years == 0:
            return 100.0 if candidate_years >= 0 else 80.0
        
        ratio = candidate_years / float(preferred_min_years)
        if ratio >= 1.0:
            return 100.0
        elif ratio >= 0.6:
            return 85.0
        elif ratio >= 0.3:
            return 70.0
        else:
            return 50.0

    @staticmethod
    def match_education(candidate_edu: str, allowed_edus: List[str]) -> float:
        """Computes education match score (0-100)."""
        if "any" in allowed_edus:
            return 100.0
        cand = (candidate_edu or "bachelor").lower()
        if cand in allowed_edus:
            return 100.0
        edu_ranks = {"diploma": 1, "bachelor": 2, "master": 3, "mba": 3, "phd": 4}
        cand_rank = edu_ranks.get(cand, 2)
        min_allowed_rank = min([edu_ranks.get(e, 2) for e in allowed_edus])
        
        if cand_rank >= min_allowed_rank:
            return 100.0
        return 75.0

    @staticmethod
    def match_domain(candidate_domains: List[str], career_domains: List[str]) -> float:
        """Computes domain alignment score (0-100)."""
        cand_set = set(candidate_domains)
        career_set = set(career_domains)
        intersection = cand_set.intersection(career_set)

        if not career_set:
            return 80.0
        
        overlap_ratio = len(intersection) / float(len(career_set))
        if overlap_ratio >= 0.5:
            return 100.0
        elif overlap_ratio > 0:
            return 75.0
        return 50.0

    @staticmethod
    def match_preferences(career_data: Dict[str, Any], preferences: Optional[Dict[str, Any]]) -> float:
        """Computes preference alignment score (0-100)."""
        if not preferences:
            return 80.0  # Default neutral positive

        score = 80.0
        preferred_cats = preferences.get("preferred_categories", [])
        if preferred_cats:
            if career_data.get("category") in preferred_cats:
                score += 20.0
            else:
                score -= 10.0

        preferred_exp = preferences.get("experience_level")
        if preferred_exp:
            min_years = career_data.get("preferred_experience", {}).get("min_years", 0)
            if preferred_exp == "entry" and min_years > 2:
                score -= 15.0

        return min(100.0, max(20.0, score))


career_matcher = CareerMatcher()
