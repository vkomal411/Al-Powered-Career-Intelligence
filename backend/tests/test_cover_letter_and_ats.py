from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cover_letter_and_ats_endpoints():
    # 1. Login user to get access token
    login_res = client.post("/auth/login", json={"email": "demo@career.ai", "password": "Demo123456!"})
    if login_res.status_code != 200:
        # Register if not found
        reg_res = client.post("/auth/register", json={"full_name": "Demo User", "email": "demo@career.ai", "password": "Demo123456!"})
        token = reg_res.json()["access_token"]
    else:
        token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test /ai/cover-letter with Formal tone
    cl_res = client.post(
        "/ai/cover-letter",
        json={
            "job_description": "We are seeking a Senior Full Stack Engineer proficient in Python, React, PostgreSQL, and AWS.",
            "tone": "formal"
        },
        headers=headers
    )
    assert cl_res.status_code == 200
    data = cl_res.json()
    assert data["tone"] == "formal"
    assert "Dear Hiring Manager" in data["salutation"]
    assert "full_text" in data

    # 3. Test /ai/cover-letter with Startup tone
    cl_startup = client.post(
        "/ai/cover-letter",
        json={
            "job_description": "Join our fast-paced startup building AI tools.",
            "tone": "startup"
        },
        headers=headers
    )
    assert cl_startup.status_code == 200
    assert cl_startup.json()["tone"] == "startup"

    # 4. Test /ai/ats-breakdown
    ats_res = client.post(
        "/ai/ats-breakdown",
        json={
            "job_description": "Python React AWS PostgreSQL Docker Kubernetes CI/CD",
            "job_title": "Senior Engineer"
        },
        headers=headers
    )
    assert ats_res.status_code == 200
    ats_data = ats_res.json()
    assert "hard_skills_score" in ats_data
    assert "found_keywords" in ats_data
    assert "missing_keywords" in ats_data
    assert ats_data["overall_score"] >= 0
