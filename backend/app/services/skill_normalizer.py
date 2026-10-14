import json
import os
import re
from typing import List, Set, Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "skills.json")

class SkillNormalizer:
    def __init__(self):
        self.aliases: Dict[str, str] = {}
        self.canonical_skills: Dict[str, Dict[str, Any]] = {}
        self._load_data()

    def _load_data(self):
        try:
            if os.path.exists(DATA_PATH):
                with open(DATA_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.aliases = data.get("aliases", {})
                    self.canonical_skills = data.get("canonical_skills", {})
        except Exception:
            self.aliases = {}
            self.canonical_skills = {}

    def normalize_single_skill(self, raw_skill: str) -> str:
        """
        Normalizes a single skill string into its canonical ID:
        e.g. 'React.JS' -> 'react', 'PostgreSQL' -> 'postgresql', 'Fast-API' -> 'fastapi'
        """
        if not raw_skill or not isinstance(raw_skill, str):
            return ""

        cleaned = raw_skill.strip().lower()
        cleaned = re.sub(r"[\t\r\n]+", " ", cleaned)
        cleaned = re.sub(r"[,\;]+$", "", cleaned).strip()

        # Direct alias lookup
        if cleaned in self.aliases:
            return self.aliases[cleaned]

        # Normalized punctuation variation
        punc_stripped = re.sub(r"[\s\-\_]+", " ", cleaned)
        if punc_stripped in self.aliases:
            return self.aliases[punc_stripped]

        # Check canonical keys directly
        if cleaned in self.canonical_skills:
            return cleaned
        
        slug = re.sub(r"[^a-z0-9\+\#\.]+", "_", cleaned).strip("_")
        if slug in self.aliases:
            return self.aliases[slug]
        if slug in self.canonical_skills:
            return slug

        return slug

    def normalize_skills(self, raw_skills: List[str]) -> List[str]:
        """Normalizes a list of skills and removes duplicates while preserving order."""
        seen: Set[str] = set()
        normalized_list: List[str] = []

        for item in raw_skills:
            if not item:
                continue
            # Handle comma-separated skills within single string
            sub_skills = [s.strip() for s in str(item).split(",") if s.strip()]
            for s in sub_skills:
                norm = self.normalize_single_skill(s)
                if norm and norm not in seen:
                    seen.add(norm)
                    normalized_list.append(norm)

        return normalized_list

    def get_skill_display_name(self, skill_id: str) -> str:
        """Returns the human-friendly display name of a skill."""
        if skill_id in self.canonical_skills:
            return self.canonical_skills[skill_id].get("name", skill_id.replace("_", " ").title())
        return skill_id.replace("_", " ").title()


# Singleton instance
skill_normalizer = SkillNormalizer()
