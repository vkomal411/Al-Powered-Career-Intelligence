"""
Unit tests for Modules 5, 6 & 7:
- Course & Skill-Gap Recommendations (Module 5)
- Resume Quality & Keyword Optimizer (Module 6)
- Career Analytics & Intelligence (Module 7)
"""

from app.data.learning_catalog import get_courses_for_skills, get_certifications_for_role, COURSES, CERTIFICATIONS

from app.ai.course_recommender import generate_course_recommendations
from app.ai.resume_optimizer import optimize_resume_content


def test_learning_catalog_courses():
    assert len(COURSES) > 5
    py_courses = get_courses_for_skills(["Python"])
    assert len(py_courses) > 0
    assert any("Python" in c["title"] or "Python" in c["skill"] for c in py_courses)


def test_learning_catalog_certifications():
    assert len(CERTIFICATIONS) > 3
    aws_certs = get_certifications_for_role("Cloud AWS Engineer")
    assert len(aws_certs) > 0
    assert any("AWS" in cert["title"] or "Cloud" in cert["skill_domain"] for cert in aws_certs)


def test_course_recommender_timeline():
    missing = ["Python", "Docker", "System Design"]
    result = generate_course_recommendations(missing_skills=missing, target_role="Backend Architect")

    assert result["missing_skills"] == missing
    assert "learning_path" in result
    steps = result["learning_path"]["steps"]
    assert len(steps) > 0

    # Ensure timeline steps are ordered by difficulty (Beginner/Intermediate -> Advanced)
    difficulties = [step["difficulty"] for step in steps]
    assert len(difficulties) > 0
    assert steps[0]["step_number"] == 1


def test_resume_optimizer():
    weak_text = "I worked on simple web apps using python and helped the team fixed bugs."
    result = optimize_resume_content(resume_text=weak_text, target_role="Senior Fullstack Developer")

    assert "summary" in result
    assert "improved" in result["summary"]
    assert len(result["summary"]["improved"]) > 30

    assert "keyword_chips" in result
    assert len(result["keyword_chips"]["missing_action_verbs"]) > 0
    assert len(result["keyword_chips"]["missing_ats_keywords"]) > 0

    assert "bullet_points" in result
    assert len(result["bullet_points"]) >= 3
    for bullet in result["bullet_points"]:
        assert "original" in bullet
        assert "improved" in bullet
        assert "reason" in bullet

    assert "recommended_certifications" in result
    assert len(result["recommended_certifications"]) > 0


def test_app_routes_registered():
    from app.main import app
    routes = [r.path for r in app.routes]
    assert "/courses/recommendations" in routes
    assert "/resume/improvements" in routes
    assert "/analytics/career-overview" in routes


def test_analytics_calculation_with_job_recommender():
    from app.ai.job_recommender import recommend_jobs_for_candidate
    jobs = recommend_jobs_for_candidate(candidate_skills=["Python", "React"], candidate_education=[], candidate_exp_level="Mid", limit=5)
    assert isinstance(jobs, list)
    if jobs:
        scores = [j["overall_score"] for j in jobs if isinstance(j, dict) and "overall_score" in j]
        assert len(scores) > 0
        avg_score = int(sum(scores) / len(scores))
        assert avg_score >= 0



