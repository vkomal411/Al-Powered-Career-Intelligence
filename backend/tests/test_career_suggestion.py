import uuid
import os
import io
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app import models
from app.services.skill_normalizer import skill_normalizer
from app.services.candidate_profile import CandidateProfile, CandidateProfileBuilder
from app.services.market_data import market_data_service
from app.ai.career.matcher import career_matcher
from app.ai.career.scorer import career_scorer
from app.ai.career.recommender import career_recommender, CareerRecommenderEngine
from app.ai.career.explainer import career_explainer
from app.database import get_db

client = TestClient(app)


def test_skill_normalization_and_aliases():
    assert skill_normalizer.normalize_single_skill("ReactJS") == "react"
    assert skill_normalizer.normalize_single_skill("React.js") == "react"
    assert skill_normalizer.normalize_single_skill("PostgreSQL") == "postgresql"
    assert skill_normalizer.normalize_single_skill("Fast-API") == "fastapi"
    assert skill_normalizer.normalize_single_skill("K8s") == "kubernetes"
    assert skill_normalizer.normalize_single_skill("AWS") == "aws"

    raw = ["Python", "React.JS", "Fast-API", "Docker", "python", "REACT"]
    norm = skill_normalizer.normalize_skills(raw)
    assert norm == ["python", "react", "fastapi", "docker"]


def test_deterministic_matcher_and_scorer():
    candidate_skills = ["python", "fastapi", "sql", "git", "docker"]
    required = {"python": 1.0, "sql": 0.8, "rest_api": 0.8, "git": 0.5}
    optional = {"docker": 0.5, "redis": 0.3}

    skill_score, matching, missing = career_matcher.match_skills(candidate_skills, required, optional)
    assert "python" in matching
    assert "sql" in matching
    assert "git" in matching
    assert "rest_api" in missing
    assert skill_score > 60.0

    exp_score = career_matcher.match_experience(candidate_years=2.0, preferred_min_years=0)
    assert exp_score == 100.0

    edu_score = career_matcher.match_education(candidate_edu="bachelor", allowed_edus=["bachelor", "master"])
    assert edu_score == 100.0

    domain_score = career_matcher.match_domain(candidate_domains=["software", "backend"], career_domains=["software", "backend"])
    assert domain_score == 100.0

    final_score = career_scorer.calculate_score(
        skill_score=skill_score,
        experience_score=exp_score,
        education_score=edu_score,
        domain_score=domain_score,
        preference_score=80.0
    )
    assert 0.0 <= final_score <= 100.0
    assert final_score == round(0.50*skill_score + 0.20*100.0 + 0.10*100.0 + 0.10*100.0 + 0.10*80.0, 1)


def test_transition_difficulty_calculation():
    # 0-2 gaps -> Low
    assert career_scorer.calculate_transition_difficulty(missing_skills_count=1, domain_score=100.0) == "Low"
    # 3-4 gaps -> Moderate
    assert career_scorer.calculate_transition_difficulty(missing_skills_count=3, domain_score=100.0) == "Moderate"
    # 5+ gaps -> High
    assert career_scorer.calculate_transition_difficulty(missing_skills_count=5, domain_score=100.0) == "High"
    # Domain distance adjustment (domain_score < 60 bumps Low to Moderate)
    assert career_scorer.calculate_transition_difficulty(missing_skills_count=1, domain_score=50.0) == "Moderate"


def test_market_data_service():
    info = market_data_service.get_market_info("backend-developer", "entry")
    assert info["career_id"] == "backend-developer"
    assert info["salary_min"] > 0
    assert info["salary_max"] > info["salary_min"]
    assert info["source"] == "market_dataset"
    assert info["updated_at"] == "2026-08-01"
    assert "₹" in info["salary_display"]


def test_candidate_profile_builder():
    fake_user = models.User(
        id=uuid.uuid4(),
        full_name="Alex Rivera",
        email="alex@example.com",
        skills=["Python", "FastAPI", "Docker", "SQLAlchemy"],
        experience_level="mid"
    )
    fake_resume = models.Resume(
        id=uuid.uuid4(),
        user_id=fake_user.id,
        original_filename="alex_resume.pdf",
        raw_text="3+ years of experience as Backend Software Engineer with Python and PostgreSQL.",
        extracted_skills=["Python", "PostgreSQL", "Git", "REST APIs"],
        extracted_education=[{"degree": "Bachelor of Technology"}]
    )

    profile = CandidateProfileBuilder.from_resume_and_user(fake_resume, fake_user)
    assert "python" in profile.normalized_skills
    assert "postgresql" in profile.normalized_skills
    assert profile.experience_years >= 3.0
    assert profile.experience_level == "mid"
    assert profile.education_level == "bachelor"
    assert "backend" in profile.domains or "software" in profile.domains


def test_career_recommender_ranking_and_explanation():
    candidate = CandidateProfile(
        skills=["Python", "FastAPI", "SQL", "Git", "Docker", "PostgreSQL"],
        normalized_skills=["python", "fastapi", "sql", "git", "docker", "postgresql"],
        experience_years=2.5,
        experience_level="mid",
        education_level="bachelor",
        domains=["software", "backend"]
    )

    result = career_recommender.recommend(candidate, preferences={"preferred_categories": ["Software Engineering"]}, top_k=5)
    assert len(result["top_career_paths"]) > 0
    assert result["engine_version"] == "career-v1"
    top_role = result["top_career_paths"][0]
    assert top_role["career_id"] in ["backend-developer", "python-developer", "full-stack-developer"]
    assert top_role["match_score"] > 60.0
    assert top_role["why_fit"] is not None
    assert top_role["growth_trajectory"] is not None
    assert len(top_role["recommended_steps"]) > 0


def test_career_suggestion_api_endpoints():
    # 1. Register test user
    email = f"career.test.{os.urandom(4).hex()}@example.com"
    reg_res = client.post(
        "/auth/register",
        json={
            "full_name": "Career Test Candidate",
            "email": email,
            "password": "Password123!",
        },
    )
    assert reg_res.status_code in (200, 201)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test career suggestion on profile without uploaded resume yet
    sug_res = client.post(
        "/ai/career-suggestion",
        json={"preferences": {"preferred_categories": ["Software Engineering"], "location": "India"}},
        headers=headers,
    )
    assert sug_res.status_code == 200
    data = sug_res.json()
    assert "top_career_paths" in data
    assert len(data["top_career_paths"]) > 0
    assert data["engine_version"] == "career-v1"

    # 3. Test with invalid/unauthorized resume_id -> must return 404/400
    fake_uuid = str(uuid.uuid4())
    bad_res = client.post(
        "/ai/career-suggestion",
        json={"resume_id": fake_uuid},
        headers=headers,
    )
    assert bad_res.status_code == 404

    # 4. Test direct resume upload career suggestion
    from unittest.mock import patch

    mock_parsed = {
        "raw_text": "Experienced Python and FastAPI backend developer with PostgreSQL and Docker.",
        "entities": {
            "name": "Career Test Candidate",
            "email": email,
            "phone": "+1234567890",
            "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"]
        },
        "sections": {
            "education": [{"degree": "B.Tech Computer Science"}],
            "experience": ["Backend Developer at Tech Corp"],
            "projects": ["REST API microservices"],
            "certifications": ["AWS Solutions Architect"]
        },
        "ats_score": 88,
        "suggestions": ["Add metrics"]
    }

    pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    with patch("app.routers.ai_router.parse_resume", return_value=mock_parsed):
        upload_res = client.post(
            "/ai/career-suggestion/upload",
            files={"file": ("candidate_resume.pdf", io.BytesIO(pdf_content), "application/pdf")},
            headers=headers,
        )
        assert upload_res.status_code == 200
        upload_data = upload_res.json()
        assert "top_career_paths" in upload_data
        assert len(upload_data["top_career_paths"]) > 0
        assert upload_data["engine_version"] == "career-v1"
