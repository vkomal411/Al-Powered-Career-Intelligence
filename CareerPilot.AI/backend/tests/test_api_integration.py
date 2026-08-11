"""
Comprehensive FastAPI Integration Test Suite
=============================================
Tests full API endpoints via TestClient.
"""

import os
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_csrf_token_endpoint():
    response = client.get("/auth/csrf")
    assert response.status_code == 200
    data = response.json()
    assert "csrf_token" in data
    assert len(data["csrf_token"]) > 0


def test_auth_and_profile_flow():
    # 1. Get CSRF token
    csrf_res = client.get("/auth/csrf")
    csrf_token = csrf_res.json()["csrf_token"]

    # 2. Register new test user
    email = f"test.api.{os.urandom(4).hex()}@example.com"
    reg_res = client.post(
        "/auth/register",
        json={
            "full_name": "API Test User",
            "email": email,
            "password": "Password123!",
        },
        headers={"X-CSRF-Token": csrf_token},
    )
    assert reg_res.status_code in (200, 201)
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]

    auth_headers = {
        "Authorization": f"Bearer {token}",
        "X-CSRF-Token": csrf_token,
    }

    # 3. Check /auth/me
    me_res = client.get("/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == email

    # 4. Update Profile
    update_res = client.put(
        "/auth/profile",
        json={
            "target_role": "Backend Engineer",
            "skills": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker"],
            "experience_level": "mid",
        },
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    updated_user = update_res.json()
    assert updated_user["target_role"] == "Backend Engineer"
    assert len(updated_user["skills"]) == 5

    # 5. Check Analytics Overview
    analytics_res = client.get("/analytics/career-overview", headers=auth_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "profile_checklist" in analytics_data
    assert "skill_coverage" in analytics_data

    # 6. Check Job Recommendations
    jobs_res = client.get("/jobs/recommendations", headers=auth_headers)
    assert jobs_res.status_code == 200
    jobs_data = jobs_res.json()
    assert "recommended_jobs" in jobs_data

    # 7. Check Course Recommendations
    courses_res = client.get(
        "/courses/recommendations?target_role=Backend Engineer",
        headers=auth_headers,
    )
    assert courses_res.status_code == 200
    courses_data = courses_res.json()
    assert "recommended_courses" in courses_data

    # 8. Check Career Roadmap Generation
    roadmap_res = client.post(
        "/career/roadmap/generate",
        json={
            "target_role": "Backend Engineer",
            "current_role": "Junior Developer",
            "current_skills": ["Python", "FastAPI"],
            "experience_level": "mid",
            "hours_per_week": 15,
            "timeline_months": 6,
        },
        headers=auth_headers,
    )
    assert roadmap_res.status_code == 200
    roadmap_data = roadmap_res.json()
    assert roadmap_data["status"] == "success"
    assert "milestones" in roadmap_data["data"]

    # 9. Test Bullet Enhancer Endpoint
    bullet_res = client.post(
        "/resume/enhance-bullet",
        json={"bullet_text": "Built APIs and helped team with backend tasks"},
        headers=auth_headers,
    )
    assert bullet_res.status_code == 200
    bullet_data = bullet_res.json()
    assert "enhanced" in bullet_data

    # 10. Test Logout
    logout_res = client.post("/auth/logout", headers=auth_headers)
    assert logout_res.status_code == 200
