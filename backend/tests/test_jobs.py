from app.ai.job_recommender import (
    calculate_skill_score,
    calculate_qualification_score,
    calculate_experience_score,
    recommend_jobs_for_candidate,
)


def test_job_skill_score_calculation():
    cand_skills = ["Python", "React", "PostgreSQL", "Docker"]
    req_skills = ["Python", "PostgreSQL", "AWS"]

    res = calculate_skill_score(cand_skills, req_skills)
    assert res["score"] == 67
    assert "Python" in res["matched"]
    assert "PostgreSQL" in res["matched"]
    assert "AWS" in res["missing"]


def test_job_qualification_score():
    candidate_edu = [{"degree": "Bachelor of Technology", "field_of_study": "Computer Science"}]
    req_edu = "Bachelor's in Computer Science or equivalent"

    score = calculate_qualification_score(candidate_edu, req_edu)
    assert score >= 90


def test_job_experience_score():
    assert calculate_experience_score("Mid", "Mid") == 100
    assert calculate_experience_score("Senior", "Mid") == 85
    assert calculate_experience_score("Entry", "Senior") == 65


def test_job_recommendation_pipeline():
    cand_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]
    cand_edu = [{"degree": "Bachelor of Science", "field_of_study": "Computer Science"}]

    jobs = recommend_jobs_for_candidate(
        candidate_skills=cand_skills,
        candidate_education=cand_edu,
        candidate_exp_level="Mid",
        limit=5
    )

    assert len(jobs) > 0
    assert jobs[0]["overall_score"] >= jobs[-1]["overall_score"]
    assert "details" in jobs[0]
    assert "skill_score" in jobs[0]["details"]
