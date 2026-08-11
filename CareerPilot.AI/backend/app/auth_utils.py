import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Refresh tokens rotated within this window are treated as a benign race
# (e.g. two browser tabs refreshing at once) rather than a stolen-token replay.
REUSE_GRACE_SECONDS = 30


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire, "iat": now, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except InvalidTokenError:
        return None
    # Reject tokens that aren't access tokens (defense-in-depth in case other
    # token types are introduced later, e.g. refresh tokens).
    if payload.get("type") != "access":
        return None
    return payload


def get_token_from_request(request: Request) -> Optional[str]:
    # 1. Try standard Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split(" ")[1]
    # 2. Fallback to access_token cookie
    return request.cookies.get("access_token")


def get_current_user(
    request: Request, db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = get_token_from_request(request)
    if token is None:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(str(user_id))
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_uuid).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    return user


def get_current_user_optional(
    request: Request, db: Session = Depends(get_db)
) -> Optional[models.User]:
    try:
        return get_current_user(request, db)
    except Exception:
        return None


import hashlib
import secrets

def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_refresh_token(
    db: Session, user_id: uuid.UUID, family_id: Optional[uuid.UUID] = None
) -> tuple[str, uuid.UUID]:
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    fam_id = family_id or uuid.uuid4()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=7)

    token_record = models.RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        family_id=fam_id,
        issued_at=now,
        expires_at=expires_at,
    )
    db.add(token_record)
    db.commit()
    db.refresh(token_record)
    return raw_token, fam_id


def rotate_refresh_token(db: Session, raw_token: str) -> tuple[str, str, models.User]:
    """
    Validates and rotates a refresh token.

    Implements REUSE DETECTION with a short GRACE WINDOW: if a token that was
    already replaced is used again *long* after it was rotated, the ENTIRE token
    family is revoked (mitigating stolen-token replay attacks). Tokens rotated
    within the last REUSE_GRACE_SECONDS are treated as a benign concurrency race
    (e.g. two browser tabs refreshing at once) and are handled by rotating the
    family's current live token instead of destroying every session.
    """
    token_hash = hash_token(raw_token)
    token_record = (
        db.query(models.RefreshToken)
        .filter(models.RefreshToken.token_hash == token_hash)
        .first()
    )

    now = datetime.now(timezone.utc)

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    def _expired(record) -> bool:
        exp = record.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return exp < now

    # Check expiration
    if _expired(token_record):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please sign in again.",
        )

    # REUSE DETECTION with grace window
    if token_record.replaced_by_id is not None or token_record.revoked_at is not None:
        revoked = token_record.revoked_at
        if revoked is not None:
            if revoked.tzinfo is None:
                revoked = revoked.replace(tzinfo=timezone.utc)
            elapsed = (now - revoked).total_seconds()
        else:
            elapsed = float("inf")

        if elapsed > REUSE_GRACE_SECONDS:
            # Genuine replay: revoke the entire family.
            db.query(models.RefreshToken).filter(
                models.RefreshToken.family_id == token_record.family_id
            ).update({"revoked_at": now})
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Security alert: Stolen token replay detected. All sessions revoked.",
            )

        # Benign concurrent-refresh race: continue rotation from the family's
        # current live token so no legitimate session is killed.
        live_token = (
            db.query(models.RefreshToken)
            .filter(
                models.RefreshToken.family_id == token_record.family_id,
                models.RefreshToken.revoked_at.is_(None),
            )
            .order_by(models.RefreshToken.issued_at.desc())
            .first()
        )
        if live_token is None or _expired(live_token):
            db.query(models.RefreshToken).filter(
                models.RefreshToken.family_id == token_record.family_id
            ).update({"revoked_at": now})
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Security alert: Stolen token replay detected. All sessions revoked.",
            )
        token_record = live_token

    # User active check
    user = db.query(models.User).filter(models.User.id == token_record.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive.",
        )

    # Mark current token as revoked
    token_record.revoked_at = now

    # Issue new token in same family
    new_raw_token, _ = create_refresh_token(db, user.id, family_id=token_record.family_id)
    new_token_hash = hash_token(new_raw_token)
    new_token_record = (
        db.query(models.RefreshToken)
        .filter(models.RefreshToken.token_hash == new_token_hash)
        .first()
    )

    if new_token_record:
        token_record.replaced_by_id = new_token_record.id

    db.commit()

    # Generate new access token
    new_access_token = create_access_token({"sub": str(user.id)})
    return new_access_token, new_raw_token, user


def revoke_token_family(db: Session, family_id: uuid.UUID) -> None:
    now = datetime.now(timezone.utc)
    db.query(models.RefreshToken).filter(
        models.RefreshToken.family_id == family_id
    ).update({"revoked_at": now})
    db.commit()

