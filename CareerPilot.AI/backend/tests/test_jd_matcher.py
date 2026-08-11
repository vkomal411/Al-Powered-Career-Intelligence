from app.ats.jd_matcher import compute_keyword_overlap


def test_keyword_overlap_exact_match():
    resume_text = "Experienced Python developer with PostgreSQL, Docker, and AWS skills."
    jd_text = "Looking for a Python software engineer with Docker and PostgreSQL experience."
    
    result = compute_keyword_overlap(resume_text, jd_text)
    assert result["overlap_score"] > 50.0
    matched_lower = [m.lower() for m in result["matched"]]
    assert "python" in matched_lower
    assert "docker" in matched_lower
    assert "postgresql" in matched_lower



def test_keyword_overlap_missing_keywords():
    resume_text = "HTML, CSS, JavaScript developer."
    jd_text = "Backend engineer with Python, FastAPI, and Kubernetes."

    result = compute_keyword_overlap(resume_text, jd_text)
    missing_lower = [m.lower() for m in result["missing"]]
    assert "python" in missing_lower
    assert "fastapi" in missing_lower
    assert "kubernetes" in missing_lower



def test_keyword_overlap_empty_input():
    result = compute_keyword_overlap("", "")
    assert result["overlap_score"] == 0.0
    assert result["matched"] == []
    assert result["missing"] == []

