"""
ATS Scorer Service.
Scores resume for ATS screening compatibility (0-100 scale).
Checks required sections, ATS-unfriendly formatting, action verb density, and keyword match count.
"""

import re
from typing import Dict, List, Any


class ATSScorerService:

    REQUIRED_SECTIONS = ["summary", "experience", "skills"]
    FORBIDDEN_CHARACTERS = ['°', '®', '™', '©', '≈', '→', '←', '↑', '↓']
    
    ACTION_VERBS = [
        "achieved", "improved", "increased", "reduced", "optimized",
        "developed", "implemented", "designed", "created", "built",
        "managed", "led", "directed", "coordinated", "collaborated",
        "analyzed", "evaluated", "assessed", "determined", "identified",
        "resolved", "solved", "fixed", "troubleshot", "debugged", "spearheaded"
    ]

    def score_resume(self, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        score = 0
        formatting_issues = []
        suggestions = []
        keyword_matches = 0

        # 1. Section Completeness Check (35 Points)
        sections_score = 0
        if resume_data.get("summary"):
            sections_score += 10
        else:
            suggestions.append("Add a concise professional summary at the top of your resume.")

        if resume_data.get("experience") and len(resume_data["experience"]) > 0:
            sections_score += 15
        else:
            formatting_issues.append("Missing work experience entries.")

        if resume_data.get("skills") and len(resume_data["skills"]) >= 3:
            sections_score += 10
        else:
            suggestions.append("Add at least 5 technical skills to pass ATS keyword filters.")

        score += sections_score

        # 2. Formatting & Character Audit (25 Points)
        format_score = 25
        text_repr = str(resume_data)

        if any(char in text_repr for char in self.FORBIDDEN_CHARACTERS):
            format_score -= 5
            formatting_issues.append("Contains non-standard special characters (arrows or symbols) that confuse ATS parsers.")

        score += max(0, format_score)

        # 3. Action Verb & Content Quality Audit (25 Points)
        content_score = 25
        exp_list = resume_data.get("experience", [])
        if exp_list:
            bullets = []
            for job in exp_list:
                if job.get("description"):
                    bullets.append(job["description"])
                bullets.extend(job.get("bullets", []))

            has_verb = any(any(verb in b.lower() for verb in self.ACTION_VERBS) for b in bullets)
            if not has_verb:
                content_score -= 10
                suggestions.append("Start your work experience bullets with strong action verbs (e.g. Spearheaded, Optimized, Built).")

            has_metrics = any(re.search(r'\d+[%$]?|[0-9]+-[0-9]+', b) for b in bullets)
            if not has_metrics:
                content_score -= 5
                suggestions.append("Include quantifiable STAR metrics (e.g. 'improved latency by 35%') in work experience bullets.")

        score += max(0, content_score)

        # 4. Keyword Frequency Count (15 Points)
        skills = resume_data.get("skills", [])
        keyword_matches = len(skills)
        keyword_score = min(15, keyword_matches * 3)
        score += keyword_score

        final_score = min(100, max(35, score))

        return {
            "score": final_score,
            "keyword_matches": keyword_matches,
            "formatting_issues": formatting_issues,
            "suggestions": suggestions
        }
