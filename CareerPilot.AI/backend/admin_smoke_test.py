import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("Running Admin Endpoint Smoke Tests...")
    
    results = []

    # 1. Login
    # OAuth2PasswordRequestForm expects 'username' and 'password'
    res = client.post(
        "/admin/auth/login",
        json={"email": "admin@careerpilot.ai", "password": "AdminPass123!"}
    )
    
    results.append({
        "endpoint": "/admin/auth/login",
        "method": "POST",
        "status_code": res.status_code,
        "pass": res.status_code == 200
    })
    
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
        
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Helper for simple requests
    def req(method, path, data=None):
        if method == "GET":
            r = client.get(path, headers=headers)
        elif method == "POST":
            r = client.post(path, headers=headers, json=data)
        elif method == "PUT":
            r = client.put(path, headers=headers, json=data)
        elif method == "DELETE":
            r = client.delete(path, headers=headers)
        
        # Consider 2xx and 404 (if item doesn't exist but endpoint is there) as PASS for a smoke test, 
        # or just log actual status. We will check if it's not 500.
        is_pass = r.status_code < 500
        
        results.append({
            "endpoint": path,
            "method": method,
            "status_code": r.status_code,
            "pass": is_pass
        })
        return r

    # Simple GETs
    req("GET", "/admin/auth/me")
    req("GET", "/admin/stats/overview")
    
    r_users = req("GET", "/admin/users")
    user_id = 1 # fallback
    if r_users.status_code == 200 and r_users.json():
        if isinstance(r_users.json(), list) and len(r_users.json()) > 0:
             # handle list or pagination dict
             user_id = r_users.json()[0].get("id", 1)
        elif isinstance(r_users.json(), dict) and "items" in r_users.json() and len(r_users.json()["items"]) > 0:
             user_id = r_users.json()["items"][0].get("id", 1)

    req("GET", f"/admin/users/{user_id}/profile")
    req("PUT", f"/admin/users/{user_id}/role", data={"role": "admin"})
    req("PUT", f"/admin/users/{user_id}/status", data={"is_active": True})
    
    req("GET", "/admin/resumes")
    req("GET", "/admin/parsing/monitoring")
    
    r_jd = req("GET", "/admin/job-descriptions")
    req("POST", "/admin/job-descriptions", data={"title": "Test Job", "description": "Desc", "requirements": []})
    req("PUT", "/admin/job-descriptions/1", data={"title": "Updated"})
    req("DELETE", "/admin/job-descriptions/1")
    
    req("GET", "/admin/ats/analytics")
    req("GET", "/admin/analytics/skill-gaps")
    req("GET", "/admin/analytics/career-recommendations")
    req("GET", "/admin/analytics/job-recommendations")
    
    req("GET", "/admin/courses")
    req("POST", "/admin/courses", data={"title": "Test Course", "url": "http://test.com", "provider": "Test"})
    req("PUT", "/admin/courses/1", data={"title": "Updated Course"})
    req("DELETE", "/admin/courses/1")
    
    req("GET", "/admin/feedback")
    req("PUT", "/admin/feedback/1", data={"status": "resolved"})
    
    # Public feedback
    r_pub_feedback = client.post("/feedback", json={"message": "Great", "rating": 5})
    results.append({
        "endpoint": "/feedback",
        "method": "POST",
        "status_code": r_pub_feedback.status_code,
        "pass": r_pub_feedback.status_code < 500
    })
    
    req("GET", "/admin/monitoring/usage")
    req("GET", "/admin/monitoring/system")
    
    req("POST", "/admin/reports/export", data={"type": "users"})
    req("GET", "/admin/reports/export/1")
    
    req("GET", "/admin/alerts")
    req("POST", "/admin/alerts", data={"message": "Test Alert", "level": "info"})
    req("DELETE", "/admin/alerts/1")
    
    req("GET", "/admin/rbac/matrix")
    req("GET", "/admin/security/audit-logs")
    req("GET", "/admin/security/status")
    
    r_health = client.get("/health")
    results.append({
        "endpoint": "/health",
        "method": "GET",
        "status_code": r_health.status_code,
        "pass": r_health.status_code < 500
    })

    print(f"\n{'METHOD':<10} | {'ENDPOINT':<50} | {'STATUS':<10} | {'PASS/FAIL'}")
    print("-" * 85)
    for res in results:
        status = "PASS" if res["pass"] else "FAIL"
        print(f"{res['method']:<10} | {res['endpoint']:<50} | {res['status_code']:<10} | {status}")

if __name__ == "__main__":
    run_tests()
