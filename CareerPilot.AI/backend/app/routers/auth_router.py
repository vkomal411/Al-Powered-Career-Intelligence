from fastapi import APIRouter, Depends, HTTPException, status, Response, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid

from app.database import get_db
from app import models, schemas
from app.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    rotate_refresh_token,
    hash_token,
    get_current_user,
    create_password_reset_token,
    verify_password_reset_token,
    revoke_all_user_sessions,
)
from app.google_auth import verify_google_token
from app.rate_limit import rate_limit
from app.config import settings
from fastapi import Request

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Magic-byte signatures for certificate uploads
PDF_MAGIC = b"%PDF-"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
JPEG_MAGIC = b"\xff\xd8\xff"


def _sniff_and_validate_certificate(filename: str, file_bytes: bytes) -> None:
    lower_name = filename.lower()
    if lower_name.endswith(".pdf"):
        if not file_bytes.startswith(PDF_MAGIC):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid PDF file",
            )
    elif lower_name.endswith(".png"):
        if not file_bytes.startswith(PNG_MAGIC):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid PNG image",
            )
    elif lower_name.endswith((".jpg", ".jpeg")):
        if not file_bytes.startswith(JPEG_MAGIC):
            raise HTTPException(
                status_code=400,
                detail="File content does not match a valid JPEG image",
            )


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    is_prod = settings.environment.lower() == "production"
    # Access token cookie (short-lived)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        samesite="lax",
        secure=is_prod,
    )
    # Refresh token cookie (long-lived 7 days)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
        secure=is_prod,
    )


def _clear_auth_cookies(response: Response) -> None:
    is_prod = settings.environment.lower() == "production"
    response.delete_cookie(key="access_token", httponly=True, samesite="lax", secure=is_prod)
    response.delete_cookie(key="refresh_token", httponly=True, samesite="lax", secure=is_prod)


@router.post(
    "/register",
    response_model=schemas.Token,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("register"))],
)
def register(payload: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This email is already connected to an account. Try signing in instead."
        )

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    refresh_token, _ = create_refresh_token(db, user.id)
    _set_auth_cookies(response, token, refresh_token)

    return schemas.Token(
        access_token=token,
        user=user
    )


@router.post(
    "/login",
    response_model=schemas.Token,
    dependencies=[Depends(rate_limit("login"))],
)
def login(payload: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    # Find user by email
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email)
        .first()
    )

    # General error message to prevent user enumeration
    invalid_credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="The password doesn't match our records. Please try again, or sign in with Google."
    )

    # Email does not exist
    if not user:
        raise invalid_credentials_error

    # Google-only account
    if not user.hashed_password:
        raise invalid_credentials_error

    # Wrong password
    if not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials_error

    token = create_access_token({"sub": str(user.id)})
    refresh_token, _ = create_refresh_token(db, user.id)
    _set_auth_cookies(response, token, refresh_token)

    return schemas.Token(
        access_token=token,
        user=user
    )


@router.post(
    "/forgot-password",
    dependencies=[Depends(rate_limit("forgot-password"))],
)
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generates a secure, time-limited password reset token.
    Uses a generic response to prevent user enumeration attacks.
    """
    email_clean = payload.email.strip().lower()
    user = (
        db.query(models.User)
        .filter(models.User.email == email_clean)
        .first()
    )

    reset_token = None
    if user and user.is_active and user.has_password:
        reset_token = create_password_reset_token(user, expires_delta_minutes=15)

    is_prod = settings.environment.lower() == "production"

    response_data = {
        "message": "If an account with that email address exists, password reset instructions have been generated."
    }
    # In non-production/development environment, include the token for easy developer testing
    if not is_prod and reset_token:
        response_data["reset_token"] = reset_token

    return response_data


@router.post(
    "/reset-password",
    dependencies=[Depends(rate_limit("reset-password"))],
)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates a cryptographic password reset token and updates the user's password.
    Revokes all active user sessions for defense-in-depth.
    """
    user = verify_password_reset_token(payload.token, db)

    # Update hashed password
    user.hashed_password = hash_password(payload.new_password)

    # Invalidate all active sessions/refresh tokens for security
    revoke_all_user_sessions(db, user.id)

    db.commit()

    return {"message": "Your password has been successfully updated! You can now sign in with your new password."}


@router.post(
    "/google-login",
    response_model=schemas.Token,
    dependencies=[Depends(rate_limit("google-login"))],
)
def google_login(payload: schemas.GoogleLoginRequest, response: Response, db: Session = Depends(get_db)):
    google_data = verify_google_token(payload.id_token)
    normalized_email = google_data["email"].strip().lower()

    user = (
        db.query(models.User)
        .filter(models.User.google_id == google_data["google_id"])
        .first()
    )

    if not user:
        # Existing email account
        user = (
            db.query(models.User)
            .filter(models.User.email == normalized_email)
            .first()
        )

        if user:
            # If account has existing password and no google_id, require email verification / block silent linking
            if user.hashed_password and not user.google_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email already exists with a password. Please sign in with your email and password.",
                )
            user.google_id = google_data["google_id"]
        else:
            user = models.User(
                full_name=google_data["full_name"],
                email=normalized_email,
                google_id=google_data["google_id"],
            )
            db.add(user)

        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    refresh_token, _ = create_refresh_token(db, user.id)
    _set_auth_cookies(response, token, refresh_token)

    return schemas.Token(
        access_token=token,
        user=user
    )


@router.post("/refresh", response_model=schemas.Token)
def refresh_session(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("refresh_token")
    if not raw_refresh_token:
        # Check header fallback
        raw_refresh_token = request.headers.get("X-Refresh-Token")

    if not raw_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token cookie missing.",
        )

    try:
        new_access_token, new_refresh_token, user = rotate_refresh_token(db, raw_refresh_token)
    except HTTPException:
        _clear_auth_cookies(response)
        raise

    _set_auth_cookies(response, new_access_token, new_refresh_token)
    return schemas.Token(access_token=new_access_token, user=user)


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_refresh_token = request.cookies.get("refresh_token")
    if raw_refresh_token:
        token_h = hash_token(raw_refresh_token)
        token_record = db.query(models.RefreshToken).filter(models.RefreshToken.token_hash == token_h).first()
        if token_record:
            from datetime import datetime, timezone
            db.query(models.RefreshToken).filter(
                models.RefreshToken.family_id == token_record.family_id
            ).update({"revoked_at": datetime.now(timezone.utc)})
            db.commit()

    _clear_auth_cookies(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name

    if payload.target_role is not None:
        current_user.target_role = payload.target_role

    if payload.experience_level is not None:
        current_user.experience_level = payload.experience_level

    if payload.industry is not None:
        current_user.industry = payload.industry

    if payload.education is not None:
        current_user.education = [edu.model_dump() for edu in payload.education]

    if payload.skills is not None:
        current_user.skills = payload.skills

    if payload.certifications is not None:
        current_user.certifications = [cert.model_dump() for cert in payload.certifications]

    if payload.projects is not None:
        current_user.projects = [proj.model_dump() for proj in payload.projects]

    if payload.new_password is not None:
        # Check if Google-only account
        if not current_user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google-connected accounts cannot set a password.",
            )

        # Verify old password
        if not payload.old_password or not verify_password(payload.old_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="That doesn't match your current password. Please try again."
            )

        # Validate strength of new password
        try:
            schemas._validate_password_strength(payload.new_password)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

        current_user.hashed_password = hash_password(payload.new_password)

    db.query(models.AnalyticsCache).filter(models.AnalyticsCache.user_id == current_user.id).delete()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/sync-profile", response_model=schemas.UserResponse)
def sync_profile_from_resume(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Auto-populates skills and credentials in the user profile using the latest parsed resume.
    """
    latest_resume = (
        db.query(models.Resume)
        .filter(models.Resume.user_id == current_user.id)
        .order_by(models.Resume.uploaded_at.desc())
        .first()
    )

    if not latest_resume:
        raise HTTPException(
            status_code=404,
            detail="No uploaded resume found to sync from. Please upload a resume first.",
        )

    # Sync skills (merge existing with newly extracted skills)
    existing_skills = set(current_user.skills or [])
    new_skills = latest_resume.extracted_skills or []
    for s in new_skills:
        existing_skills.add(s)
    current_user.skills = list(existing_skills)
    db.query(models.AnalyticsCache).filter(models.AnalyticsCache.user_id == current_user.id).delete()
    db.commit()
    db.refresh(current_user)
    return current_user


UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-certificate")
async def upload_certificate(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    # Validate file extension (e.g. pdf, png, jpg, jpeg)
    allowed_extensions = (".pdf", ".png", ".jpg", ".jpeg")
    filename = os.path.basename(file.filename or "")
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, PNG, JPG, or JPEG files are allowed.",
        )
    
    # Enforce a maximum file size of 5MB
    max_bytes = 5 * 1024 * 1024
    chunks = []
    total_size = 0
    chunk_size = 1024 * 1024

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > max_bytes:
            raise HTTPException(
                status_code=413,
                detail="File exceeds the maximum allowed size of 5 MB",
            )
        chunks.append(chunk)

    file_bytes = b"".join(chunks)
    if total_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty",
        )

    # Perform magic-byte validation
    _sniff_and_validate_certificate(filename, file_bytes)

    # Generate a unique user-scoped filename to prevent IDOR and collisions
    unique_filename = f"{current_user.id}_{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to save uploaded certificate file."
        )
        
    # Return the file key for retrieval via protected endpoint
    file_url = f"/auth/certificates/{unique_filename}"
    return {"file_url": file_url, "filename": filename}


@router.get("/certificates/{filename}")
def get_certificate(
    filename: str,
    current_user: models.User = Depends(get_current_user)
):
    safe_filename = os.path.basename(filename)
    
    # Enforce ownership check to prevent IDOR
    if not safe_filename.startswith(f"{current_user.id}_"):
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this certificate."
        )

    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Certificate file not found."
        )

    from fastapi.responses import FileResponse
    return FileResponse(file_path)


import secrets
import hmac
import hashlib

def generate_csrf_signature(token: str) -> str:
    return hmac.new(
        settings.jwt_secret_key.encode("utf-8"),
        token.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

@router.get("/csrf")
def get_csrf_token(response: Response):
    """
    Issues a signed double-submit CSRF token.
    Sets 'csrf_token' cookie and returns token in JSON body.
    """
    token = secrets.token_hex(32)
    signature = generate_csrf_signature(token)
    signed_cookie_value = f"{token}.{signature}"

    response.set_cookie(
        key="csrf_token",
        value=signed_cookie_value,
        httponly=False,  # Accessible so browser can verify or double-submit
        samesite="lax",
        secure=settings.environment.lower() == "production",
    )

    return {"csrf_token": token}