from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_admin_revoke_user_sessions_and_sso():
    # 1. Login admin
    login_res = client.post(
        "/admin/auth/login",
        json={"email": "admin@careerpilot.ai", "password": "AdminPass123!"}
    )
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Get list of users to find a target user
    users_res = client.get("/admin/users", headers=headers)
    assert users_res.status_code == 200
    users = users_res.json()["items"]
    assert len(users) > 0

    import uuid as uuid_lib
    random_email = f"revoke.{uuid_lib.uuid4().hex[:6]}@career.ai"
    reg_res = client.post(
        "/auth/register",
        json={"full_name": "Temp Test User", "email": random_email, "password": "UserPass123!"}
    )
    assert reg_res.status_code == 201
    target_id = reg_res.json()["user"]["id"]
    target_email = random_email

    # 3. Test user deep-dive profile endpoint
    profile_res = client.get(f"/admin/users/{target_id}/profile", headers=headers)
    assert profile_res.status_code == 200
    profile_data = profile_res.json()
    assert profile_data["email"] == target_email
    assert "skills" in profile_data
    assert "resumes" in profile_data

    # 4. Test session revocation endpoint
    revoke_res = client.put(f"/admin/users/{target_id}/revoke-sessions", headers=headers)
    assert revoke_res.status_code == 200
    assert "Revoked" in revoke_res.json()["message"]

    # 5. Verify security status endpoint
    sec_res = client.get("/admin/security/status", headers=headers)
    assert sec_res.status_code == 200
    assert sec_res.json()["rate_limiting_active"] is True
