import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CareerPreferences(BaseModel):
    preferred_categories: Optional[List[str]] = Field(default=None, description="Preferred career categories e.g. Software Engineering")
    preferred_work_style: Optional[str] = Field(default=None, description="remote, hybrid, onsite")
    location: Optional[str] = Field(default="India", description="Target location/country")
    minimum_salary: Optional[float] = Field(default=None, description="Minimum expected salary")
    experience_level: Optional[str] = Field(default=None, description="entry, mid, senior")


class CareerSuggestionRequest(BaseModel):
    resume_id: Optional[uuid.UUID] = Field(default=None, description="ID of previously uploaded resume")
    preferences: Optional[CareerPreferences] = Field(default=None, description="Structured user career preferences")
    custom_preferences: Optional[str] = Field(default=None, description="Free text user goals or notes")


class MarketInfoSchema(BaseModel):
    career_id: str
    experience_level: str
    salary_min: float
    salary_max: float
    currency: str = "INR"
    market_demand: str = "High"
    source: str = "market_dataset"
    updated_at: str = "2026-08-01"
    salary_display: str


class CareerPathSuggestion(BaseModel):
    career_id: str
    career_title: str
    category: str
    description: str
    match_score: float
    match_level: str
    matching_skills: List[str]
    matching_skills_display: List[str]
    missing_skills: List[str]
    missing_skills_display: List[str]
    transition_difficulty: str  # Low, Moderate, High
    why_fit: Optional[str] = None
    growth_trajectory: Optional[str] = None
    recommended_steps: Optional[List[str]] = None
    missing_skills_summary: Optional[str] = None
    market_info: MarketInfoSchema
    confidence: float = 0.85
    component_scores: Optional[Dict[str, float]] = None
    is_alternative: bool = False


class CareerSuggestionResponse(BaseModel):
    summary: str
    candidate_strengths: List[str]
    top_career_paths: List[CareerPathSuggestion]
    alternative_paths: List[CareerPathSuggestion] = []
    recommended_certifications: List[str] = []
    engine_version: str = "career-v1"
    generated_at: str
    evaluated_count: int
    cached: bool = False
