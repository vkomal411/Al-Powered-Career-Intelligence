import os
import pytest

# Ensure standard testing environment variables are configured before importing app components
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("TESTING", "true")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-characters-long")
os.environ.setdefault("ADMIN_INITIAL_PASSWORD", "AdminPass123!")
os.environ.setdefault("ADMIN_EMAIL", "admin@careerpilot.ai")
os.environ.setdefault("DEMO_INITIAL_PASSWORD", "Demo123456!")
os.environ.setdefault("DEMO_EMAIL", "demo@career.ai")

from app.database import Base, engine
from app import models
from app.main import auto_seed_database_if_needed


@pytest.fixture(scope="session", autouse=True)
def init_test_database():
    """
    Session-wide fixture that initializes database schema and seeds
    the standard administrative and demo test users.
    """
    try:
        Base.metadata.create_all(bind=engine)
        auto_seed_database_if_needed()
    except Exception as e:
        print(f"init_test_database notice: {e}")
    yield
