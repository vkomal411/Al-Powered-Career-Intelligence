from typing import Dict, Any, List, Optional


class CareerExplanationValidator:
    @staticmethod
    def validate_explanation(explanation_dict: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validates LLM output fields and ensures safe fallbacks for missing or malformed keys.
        """
        if not explanation_dict or not isinstance(explanation_dict, dict):
            return {}

        validated: Dict[str, Any] = {}

        # 1. why_fit
        why_fit = explanation_dict.get("why_fit")
        if isinstance(why_fit, str) and len(why_fit.strip()) > 10:
            validated["why_fit"] = why_fit.strip()

        # 2. growth_trajectory
        trajectory = explanation_dict.get("growth_trajectory")
        if isinstance(trajectory, str) and len(trajectory.strip()) > 10:
            validated["growth_trajectory"] = trajectory.strip()

        # 3. recommended_steps
        steps = explanation_dict.get("recommended_steps")
        if isinstance(steps, list) and len(steps) > 0:
            valid_steps = [str(s).strip() for s in steps if str(s).strip()]
            if valid_steps:
                validated["recommended_steps"] = valid_steps[:4]

        # 4. missing_skills_summary
        missing_summary = explanation_dict.get("missing_skills_summary")
        if isinstance(missing_summary, str) and len(missing_summary.strip()) > 5:
            validated["missing_skills_summary"] = missing_summary.strip()

        return validated


career_validator = CareerExplanationValidator()
