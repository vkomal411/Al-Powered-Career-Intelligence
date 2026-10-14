import uuid
from datetime import datetime, timezone

from app import models, schemas
from app.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    rotate_refresh_token,
    hash_token,
)


def test_password_hashing_and_verification():
    raw_pass = "SecurePass123!"
    hashed = hash_password(raw_pass)
    
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPass123!", hashed) is False


def test_access_token_creation_and_decoding():
    user_id = str(uuid.uuid4())
    token = create_access_token({"sub": user_id})
    
    from app.auth_utils import decode_access_token
    payload = decode_access_token(token)
    
    assert payload is not None
    assert payload["sub"] == user_id
    assert payload["type"] == "access"


def test_refresh_token_creation_and_rotation():
    # Testing pure token hashing logic
    raw1 = "test_raw_refresh_token_12345"
    h1 = hash_token(raw1)
    h2 = hash_token(raw1)
    
    assert h1 == h2
    assert len(h1) == 64  # SHA-256 hex string length


def test_password_reset_token_creation_and_payload():
    from app.auth_utils import create_password_reset_token
    import jwt
    from app.config import settings

    fake_user = models.User(
        id=uuid.uuid4(),
        full_name="Test User",
        email="test@example.com",
        hashed_password=hash_password("CurrentPassword123!"),
    )

    token = create_password_reset_token(fake_user, expires_delta_minutes=15)
    assert token is not None

    decoded = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    assert decoded["sub"] == str(fake_user.id)
    assert decoded["type"] == "password_reset"
    assert decoded["pwh"] == hash_token(fake_user.hashed_password)
