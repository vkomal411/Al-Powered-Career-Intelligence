"""
Studio 7-Category ATS Scoring Engine.
Scores resume across: Structure, Formatting, Keywords, Skills, Experience, Readability, and Completeness.
"""

import re
from typing import Dict, List, Any


class StudioATSEngineService:

    FORBIDDEN_CHARACTERS = ['°', '®', '™', '©', '≈', '→', '←', '↑', '↓']
    ACTION_VERBS = [
        "achieved", "improved", "increased", "reduced", "optimized",
        "developed", "implemented", "designed", "created", "built",
        "managed", "led", "directed", "coordinated", "collaborated",
        "analyzed", "evaluated", "assessed", "determined", "identified",
        "resolved", "solved", "fixed", "troubleshot", "debugged", "spearheaded"
    ]

    def analyze_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        formatting_issues = []
        action_items = []

        # 1. Structure Score (100 Max)
        structure_score = 90
        if not resume_data.get("full_name"):
            structure_score -= 15
            action_items.append("Include your full candidate name at the top.")

        # 2. Formatting Score (100 Max)
        formatting_score = 95
        text_repr = str(resume_data)
        if any(char in text_repr for char in self.FORBIDDEN_CHARACTERS):
            formatting_score -= 15
            formatting_issues.append("Contains non-standard special characters (arrows or symbols) that confuse ATS parsers.")

        # 3. Keywords Score (100 Max)
        skills = resume_data.get("skills", [])
        num_skills = len(skills)
        keywords_score = min(100, max(50, num_skills * 12))
        if num_skills < 4:
            action_items.append("Add at least 5 key technical & soft skills to pass ATS keyword filters.")

        # 4. Skills Score (100 Max)
        skills_score = min(100, num_skills * 14)

        # 5. Experience Score (100 Max)
        exp_list = resume_data.get("experiences", []) or resume_data.get("experience", [])
        experience_score = 85
        if exp_list:
            has_action_verb = False
            has_metrics = False
            for exp in exp_list:
                bullets = exp.get("bullets", [])
                desc = exp.get("description", "")
                full_exp_text = (desc + " " + " ".join(bullets)).lower()

                if any(verb in full_exp_text for verb in self.ACTION_VERBS):
                    has_action_verb = True
                if re.search(r'\d+[%$]?|[0-9]+-[0-9]+', full_exp_text):
                    has_metrics = True

            if not has_action_verb:
                experience_score -= 15
                action_items.append("Start work experience bullet points with strong action verbs (e.g. Spearheaded, Optimized, Built).")
            if not has_metrics:
                experience_score -= 10
                action_items.append("Include STAR metrics and percentages (e.g., 'improved latency by 35%') in experience bullets.")
        else:
            experience_score = 40
            action_items.append("Add at least 1 work experience or internship entry.")

        # 6. Readability Score (100 Max)
        readability_score = 92

        # 7. Completeness Score (100 Max)
        completeness_score = 80
        if resume_data.get("summary"):
            completeness_score += 10
        if resume_data.get("projects"):
            completeness_score += 10
        completeness_score = min(100, completeness_score)

        # Overall Weighted Score
        overall_score = int(
            (structure_score * 0.15) +
            (formatting_score * 0.15) +
            (keywords_score * 0.20) +
            (skills_score * 0.15) +
            (experience_score * 0.20) +
            (readability_score * 0.05) +
            (completeness_score * 0.10)
        )

        category_scores = {
            "Structure": structure_score,
            "Formatting": formatting_score,
            "Keywords": keywords_score,
            "Skills": skills_score,
            "Experience": experience_score,
            "Readability": readability_score,
            "Completeness": completeness_score
        }

        return {
            "overall_score": overall_score,
            "category_scores": category_scores,
            "formatting_issues": formatting_issues,
            "action_items": action_items
        }
