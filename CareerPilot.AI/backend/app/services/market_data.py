import json
import os
from typing import Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "market_data.json")


class MarketDataService:
    def __init__(self):
        self.market_dataset: Dict[str, Any] = {}
        self.source: str = "market_dataset"
        self.updated_at: str = "2026-08-01"
        self.default_currency: str = "INR"
        self._load_data()

    def _load_data(self):
        try:
            if os.path.exists(DATA_PATH):
                with open(DATA_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.market_dataset = data.get("roles", {})
                    self.source = data.get("source", "market_dataset")
                    self.updated_at = data.get("updated_at", "2026-08-01")
                    self.default_currency = data.get("default_currency", "INR")
        except Exception:
            self.market_dataset = {}

    def get_market_info(self, career_id: str, experience_level: str = "entry") -> Dict[str, Any]:
        """Returns structured salary and demand data for a career at a given experience level."""
        level = (experience_level or "entry").lower()
        if level not in {"entry", "mid", "senior"}:
            level = "entry"

        role_data = self.market_dataset.get(career_id, {})
        level_data = role_data.get(level)

        if not level_data:
            # Fallback default estimation
            defaults = {
                "entry": {"salary_min": 400000, "salary_max": 800000, "currency": self.default_currency, "market_demand": "High"},
                "mid": {"salary_min": 800000, "salary_max": 1600000, "currency": self.default_currency, "market_demand": "High"},
                "senior": {"salary_min": 1600000, "salary_max": 3200000, "currency": self.default_currency, "market_demand": "Very High"},
            }
            level_data = defaults[level]

        return {
            "career_id": career_id,
            "experience_level": level,
            "salary_min": level_data["salary_min"],
            "salary_max": level_data["salary_max"],
            "currency": level_data.get("currency", self.default_currency),
            "market_demand": level_data.get("market_demand", "High"),
            "source": self.source,
            "updated_at": self.updated_at,
            "salary_display": f"₹{level_data['salary_min']/100000:.1f}L – ₹{level_data['salary_max']/100000:.1f}L"
        }


# Singleton instance
market_data_service = MarketDataService()
