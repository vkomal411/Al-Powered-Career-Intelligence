from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status

from app.config import settings


def verify_google_token(token: str) -> dict:
    """
    Verifies a Google ID token sent from the frontend (Google Sign-In button)
    and returns the decoded payload containing email, name, sub (google_id), etc.
    """
    try:
        idinfo = id_token.verify_oauth2_token(
            token, google_requests.Request(), settings.google_client_id
        )
        if not idinfo.get("email_verified", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google account email is not verified",
            )
        return {
            "google_id": idinfo["sub"],
            "email": idinfo["email"],
            "full_name": idinfo.get("name", idinfo["email"].split("@")[0]),
        }
    except HTTPException:
        raise
    except (ValueError, KeyError):
        # ValueError: invalid/expired/tampered token or wrong audience.
        # KeyError: unexpected payload shape missing required claims.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
    except Exception:
        # Catch-all so a transient network/library error never leaks
        # internals to the client as a raw 500.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify Google token",
        )
