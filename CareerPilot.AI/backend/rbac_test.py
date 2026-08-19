import sys
import uuid
from fastapi.testclient import TestClient
from app.main import app

# Create test client
client = TestClient(app)

def run_tests():
    print("Running RBAC Security Tests...")
    
    # 1. Test without token (Should be 401 Unauthorized for admin endpoints)
    print("\n--- Testing without Token ---")
    res_no_token = client.get("/admin/stats/overview")
    print(f"GET /admin/stats/overview (no token) -> Status: {res_no_token.status_code}")
    if res_no_token.status_code != 401:
        print("FAIL: Expected 401")
        
    # 2. Test with regular user token (Should be 403 Forbidden)
    print("\n--- Testing with Regular User Token ---")
    
    # Let's override the admin requirement or just authenticate as a normal user.
    # Actually, we can just use the login endpoint if there is one for normal users.
    # Otherwise, we can mock the get_current_user dependency!
    from app.auth_utils import get_current_user
    from pydantic import BaseModel
    
    class MockUser:
        id = uuid.uuid4()
        email = "normal@user.com"
        role = "user"  # explicitly not "admin"
        is_active = True
        is_admin = False
        
    app.dependency_overrides[get_current_user] = lambda: MockUser()
    
    res_user_token = client.get("/admin/stats/overview")
    print(f"GET /admin/stats/overview (regular user token mock) -> Status: {res_user_token.status_code}")
    if res_user_token.status_code != 403:
        print("FAIL: Expected 403, got", res_user_token.status_code)
        
    # cleanup
    app.dependency_overrides.clear()
        
if __name__ == "__main__":
    run_tests()
