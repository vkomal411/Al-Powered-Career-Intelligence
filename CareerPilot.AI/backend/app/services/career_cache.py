import hashlib
import json
import uuid
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app import models
from app.ai.career.recommender import CareerRecommenderEngine

logger = logging.getLogger("career_platform")


class CareerCacheService:
    @staticmethod
    def compute_cache_key(user_id: uuid.UUID, resume_id: Optional[uuid.UUID], preferences: Optional[Dict[str, Any]]) -> str:
        pref_str = json.dumps(preferences or {}, sort_keys=True)
        raw = f"{user_id}:{resume_id}:{pref_str}:{CareerRecommenderEngine.ENGINE_VERSION}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    @classmethod
    def get_cached_suggestion(
        cls,
        db: Session,
        user_id: uuid.UUID,
        resume_id: Optional[uuid.UUID],
        preferences: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Looks up the most recent matching suggestion record in database."""
        try:
            query = db.query(models.CareerSuggestion).filter(
                models.CareerSuggestion.user_id == user_id,
                models.CareerSuggestion.engine_version == CareerRecommenderEngine.ENGINE_VERSION
            )

            if resume_id:
                query = query.filter(models.CareerSuggestion.resume_id == resume_id)
            else:
                query = query.filter(models.CareerSuggestion.resume_id.is_(None))

            record = query.order_by(models.CareerSuggestion.created_at.desc()).first()
            if not record:
                return None

            # Verify preferences match
            saved_pref = record.preferences or {}
            current_pref = preferences or {}
            if json.dumps(saved_pref, sort_keys=True) != json.dumps(current_pref, sort_keys=True):
                return None

            # Reconstruct response payload
            top_paths = []
            alt_paths = []

            for item in record.items:
                path_dict = {
                    "career_id": item.career_id,
                    "career_title": item.career_title,
                    "category": item.category,
                    "description": "",
                    "match_score": item.match_score,
                    "match_level": item.match_level,
                    "matching_skills": item.matching_skills or [],
                    "matching_skills_display": [s.replace("_", " ").title() for s in (item.matching_skills or [])],
                    "missing_skills": item.missing_skills or [],
                    "missing_skills_display": [s.replace("_", " ").title() for s in (item.missing_skills or [])],
                    "transition_difficulty": item.transition_difficulty,
                    "why_fit": item.why_fit,
                    "growth_trajectory": item.growth_trajectory,
                    "recommended_steps": item.recommended_steps or [],
                    "market_info": item.salary_snapshot or {},
                    "confidence": 0.90,
                    "is_alternative": item.is_alternative == "true"
                }
                if item.is_alternative == "true":
                    alt_paths.append(path_dict)
                else:
                    top_paths.append(path_dict)

            return {
                "summary": record.summary or "Reconstructed from cached analysis.",
                "candidate_strengths": record.candidate_strengths or [],
                "top_career_paths": top_paths,
                "alternative_paths": alt_paths,
                "recommended_certifications": record.recommended_certifications or [],
                "engine_version": record.engine_version,
                "generated_at": record.created_at.isoformat() if record.created_at else datetime.now(timezone.utc).isoformat(),
                "evaluated_count": len(top_paths) + len(alt_paths),
                "cached": True
            }
        except Exception as e:
            logger.warning("Failed to retrieve cached career suggestion: %s", e)
            return None

    @classmethod
    def save_suggestion(
        cls,
        db: Session,
        user_id: uuid.UUID,
        resume_id: Optional[uuid.UUID],
        preferences: Optional[Dict[str, Any]],
        result: Dict[str, Any]
    ) -> Optional[models.CareerSuggestion]:
        """Persists a new CareerSuggestion and child CareerSuggestionItem rows."""
        try:
            suggestion = models.CareerSuggestion(
                user_id=user_id,
                resume_id=resume_id,
                preferences=preferences,
                summary=result.get("summary"),
                candidate_strengths=result.get("candidate_strengths"),
                recommended_certifications=result.get("recommended_certifications"),
                engine_version=result.get("engine_version", CareerRecommenderEngine.ENGINE_VERSION),
            )
            db.add(suggestion)
            db.flush()

            # Add Top Career Paths
            for p in result.get("top_career_paths", []):
                item = models.CareerSuggestionItem(
                    suggestion_id=suggestion.id,
                    career_id=p["career_id"],
                    career_title=p["career_title"],
                    category=p["category"],
                    match_score=p["match_score"],
                    match_level=p["match_level"],
                    matching_skills=p["matching_skills"],
                    missing_skills=p["missing_skills"],
                    transition_difficulty=p["transition_difficulty"],
                    why_fit=p.get("why_fit"),
                    growth_trajectory=p.get("growth_trajectory"),
                    recommended_steps=p.get("recommended_steps"),
                    salary_snapshot=p.get("market_info"),
                    market_demand_snapshot=p.get("market_info", {}).get("market_demand", "High"),
                    is_alternative="false"
                )
                db.add(item)

            # Add Alternative Paths
            for p in result.get("alternative_paths", []):
                item = models.CareerSuggestionItem(
                    suggestion_id=suggestion.id,
                    career_id=p["career_id"],
                    career_title=p["career_title"],
                    category=p["category"],
                    match_score=p["match_score"],
                    match_level=p["match_level"],
                    matching_skills=p["matching_skills"],
                    missing_skills=p["missing_skills"],
                    transition_difficulty=p["transition_difficulty"],
                    why_fit=p.get("why_fit"),
                    growth_trajectory=p.get("growth_trajectory"),
                    recommended_steps=p.get("recommended_steps"),
                    salary_snapshot=p.get("market_info"),
                    market_demand_snapshot=p.get("market_info", {}).get("market_demand", "High"),
                    is_alternative="true"
                )
                db.add(item)

            db.commit()
            db.refresh(suggestion)
            return suggestion
        except Exception as e:
            db.rollback()
            logger.error("Failed to persist career suggestion: %s", e)
            return None


career_cache_service = CareerCacheService()
