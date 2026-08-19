import sys

def test_imports():
    success = True
    print("Testing imports...")
    
    try:
        from app.main import app
        print("SUCCESS: from app.main import app")
    except Exception as e:
        print(f"FAILED: from app.main import app - {e}")
        success = False

    try:
        from app.routers.admin_router import router
        print("SUCCESS: from app.routers.admin_router import router")
    except Exception as e:
        print(f"FAILED: from app.routers.admin_router import router - {e}")
        success = False

    try:
        from app.schemas.admin_schemas import AdminOverviewStatsOut
        print("SUCCESS: from app.schemas.admin_schemas import AdminOverviewStatsOut")
    except Exception as e:
        print(f"FAILED: from app.schemas.admin_schemas import AdminOverviewStatsOut - {e}")
        success = False

    assert success, "One or more imports failed"

if __name__ == "__main__":
    test_imports()
