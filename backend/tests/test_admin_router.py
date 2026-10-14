import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_login_and_rbac():
    # 1. Test Admin Login
    response = client.post(
        "/admin/auth/login",
        json={"email": "admin@careerpilot.ai", "password": "AdminPass123!"}
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Overview Stats
    stats_res = client.get("/admin/stats/overview", headers=headers)
    assert stats_res.status_code == 200
    stats_data = stats_res.json()
    assert "total_users" in stats_data
    assert "avg_ats_score" in stats_data

    # 3. Test Users List
    users_res = client.get("/admin/users", headers=headers)
    assert users_res.status_code == 200
    assert "items" in users_res.json()

    # 4. Test Job Description CRUD
    jd_res = client.post(
        "/admin/job-descriptions",
        json={
            "title": "Lead DevOps Architect",
            "company": "CloudScale Inc",
            "raw_text": "Looking for DevOps Lead with Kubernetes, Terraform, and AWS experience.",
            "required_skills": ["Kubernetes", "Terraform", "AWS"],
            "is_active": True
        },
        headers=headers
    )
    assert jd_res.status_code == 200
    jd_id = jd_res.json()["id"]

    # 5. Test System Health (DB Engine Pool)
    sys_res = client.get("/admin/monitoring/system", headers=headers)
    assert sys_res.status_code == 200
    assert sys_res.json()["status"] == "OPERATIONAL"

    # 6. Test Public Feedback Submission (No auth)
    fb_submit = client.post(
        "/feedback",
        json={"category": "feature", "rating": 5, "message": "Automated test user feedback"}
    )
    assert fb_submit.status_code == 201

    # 7. Test Admin Feedback View
    fb_list = client.get("/admin/feedback", headers=headers)
    assert fb_list.status_code == 200
    assert len(fb_list.json()["items"]) > 0

    # 8. Test Security Audit Logs
    audit_res = client.get("/admin/security/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()["items"]) > 0

    # 9. Test System Alerts CRUD
    alert_create_res = client.post(
        "/admin/alerts",
        json={
            "title": "Scheduled Platform Maintenance",
            "message": "Routine database maintenance window at 02:00 UTC.",
            "severity": "warning",
            "is_broadcast": True
        },
        headers=headers
    )
    assert alert_create_res.status_code == 200
    alert_id = alert_create_res.json()["id"]

    alerts_list_res = client.get("/admin/alerts", headers=headers)
    assert alerts_list_res.status_code == 200
    alerts_data = alerts_list_res.json()
    assert any(a["id"] == alert_id for a in alerts_data)

    alert_del_res = client.delete(f"/admin/alerts/{alert_id}", headers=headers)
    assert alert_del_res.status_code == 200

    # 10. Test Non-Admin Access Blocking
    no_auth_res = client.get("/admin/users")
    assert no_auth_res.status_code == 401


def test_admin_monitoring_alias_endpoints():
    login_res = client.post(
        "/admin/auth/login",
        json={"email": "admin@careerpilot.ai", "password": "AdminPass123!"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test all 5 monitoring endpoints with both standard & alias routes
    assert client.get("/admin/monitoring/parsing-ocr", headers=headers).status_code == 200
    assert client.get("/admin/parsing/monitoring", headers=headers).status_code == 200

    assert client.get("/admin/monitoring/ats-quality", headers=headers).status_code == 200
    assert client.get("/admin/ats/analytics", headers=headers).status_code == 200

    assert client.get("/admin/monitoring/skill-gap", headers=headers).status_code == 200
    assert client.get("/admin/analytics/skill-gaps", headers=headers).status_code == 200

    assert client.get("/admin/monitoring/career-intelligence", headers=headers).status_code == 200
    assert client.get("/admin/analytics/career-recommendations", headers=headers).status_code == 200

    assert client.get("/admin/monitoring/job-recommendations", headers=headers).status_code == 200
    assert client.get("/admin/analytics/job-recommendations", headers=headers).status_code == 200

    assert client.get("/admin/monitoring/usage", headers=headers).status_code == 200
    assert client.get("/admin/rbac/matrix", headers=headers).status_code == 200


def test_targeted_promotion_and_alerts_privacy():
    # 1. Admin login
    login_res = client.post(
        "/admin/auth/login",
        json={"email": "admin@careerpilot.ai", "password": "AdminPass123!"}
    )
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register Candidate A (to be promoted)
    import os
    email_a = f"promo.user.a.{os.urandom(4).hex()}@example.com"
    reg_a = client.post("/auth/register", json={"full_name": "User Alpha", "email": email_a, "password": "UserPass123!"})
    assert reg_a.status_code in (200, 201)
    token_a = reg_a.json()["access_token"]
    user_a_id = reg_a.json()["user"]["id"]

    # 3. Register Candidate B (should NOT see User A's promotion)
    email_b = f"normal.user.b.{os.urandom(4).hex()}@example.com"
    reg_b = client.post("/auth/register", json={"full_name": "User Beta", "email": email_b, "password": "UserPass123!"})
    assert reg_b.status_code in (200, 201)
    token_b = reg_b.json()["access_token"]

    # 4. Promote User A to Moderator
    promote_res = client.put(
        f"/admin/users/{user_a_id}/role",
        json={"role": "moderator"},
        headers=admin_headers
    )
    assert promote_res.status_code == 200
    promo_data = promote_res.json()
    assert promo_data["new_role"] == "moderator"

    # 5. User A checks /alerts/active -> MUST receive their promotion alert
    alerts_a = client.get("/alerts/active", headers={"Authorization": f"Bearer {token_a}"})
    assert alerts_a.status_code == 200
    alerts_a_data = alerts_a.json()
    user_a_has_promo = any("Account Role Promotion" in a["title"] and "User Alpha" in a["message"] for a in alerts_a_data)
    assert user_a_has_promo, "Promoted user did not receive their personal promotion alert"

    # 6. User B checks /alerts/active -> MUST NOT see User A's promotion alert (privacy check)
    alerts_b = client.get("/alerts/active", headers={"Authorization": f"Bearer {token_b}"})
    assert alerts_b.status_code == 200
    alerts_b_data = alerts_b.json()
    user_b_has_user_a_promo = any("User Alpha" in a["message"] for a in alerts_b_data)
    assert not user_b_has_user_a_promo, "Privacy violation: User B saw User A's targeted promotion alert"

