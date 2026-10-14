import pytest
from app.email_service import email_service
from app.ai.job_recommender import fetch_live_market_jobs, recommend_jobs_for_candidate
from app.resume_parser import extract_text_from_pdf


def test_email_service_fallback():
    """Verifies that EmailService gracefully formats and logs password reset emails."""
    result = email_service.send_password_reset_email("testcandidate@example.com", "dummy_sample_token_123")
    assert result is True


def test_live_job_market_recommender():
    """Verifies that the job recommendation pipeline correctly processes the source filter."""
    curated_jobs = recommend_jobs_for_candidate(
        candidate_skills=["Python", "FastAPI", "PostgreSQL"],
        candidate_education=[{"degree": "B.Tech"}],
        candidate_exp_level="Mid",
        source_filter="curated",
        limit=5,
    )
    assert len(curated_jobs) > 0
    for j in curated_jobs:
        assert j.get("source") == "Curated Partner"
        assert "apply_url" in j

    combined_jobs = recommend_jobs_for_candidate(
        candidate_skills=["Python", "React", "TypeScript"],
        candidate_education=[{"degree": "Bachelor"}],
        candidate_exp_level="Senior",
        limit=5,
    )
    assert len(combined_jobs) > 0


def test_resume_parser_empty_pdf_error():
    """Verifies that an empty/corrupted PDF triggers an actionable error message."""
    dummy_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    with pytest.raises(ValueError) as exc_info:
        extract_text_from_pdf(dummy_pdf_bytes)
    err_msg = str(exc_info.value).lower()
    assert "could not read pdf file" in err_msg or "no readable text found" in err_msg or "scanned" in err_msg
