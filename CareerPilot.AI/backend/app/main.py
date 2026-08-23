import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    auth_router,
    resume_router,
    ai_router,
    tailor_router,
    jobs_router,
    courses_router,
    analytics_router,
    roadmap_router,
    studio_router,
    resume_builder_router,
    admin_router,
)


logger = logging.getLogger("career_platform")

from app.database import Base, engine
from app import models

# Ensure all application tables exist safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning("Base.metadata.create_all skipped or failed: %s", e)


def auto_seed_database_if_needed():
    # Never auto-seed default dummy accounts in production without explicit configuration
    if settings.environment.lower() == "production" and not os.getenv("ADMIN_INITIAL_PASSWORD"):
        logger.info("Production mode detected without ADMIN_INITIAL_PASSWORD: auto-seeding skipped.")
        return

    from app.database import SessionLocal
    from app.auth_utils import hash_password
    import uuid
    import os

    admin_email = os.getenv("ADMIN_EMAIL", "admin@careerpilot.ai")
    admin_password = os.getenv("ADMIN_INITIAL_PASSWORD", "AdminPass123!")
    ops_admin_email = os.getenv("OPS_ADMIN_EMAIL", "ops.admin@careerpilot.ai")
    ops_admin_password = os.getenv("OPS_ADMIN_INITIAL_PASSWORD", "AdminPass123!")
    moderator_email = os.getenv("MODERATOR_EMAIL", "moderator@careerpilot.ai")
    moderator_password = os.getenv("MODERATOR_INITIAL_PASSWORD", "ModeratorPass123!")
    demo_email = os.getenv("DEMO_EMAIL", "demo@career.ai")
    demo_password = os.getenv("DEMO_INITIAL_PASSWORD", "Demo123456!")

    db = SessionLocal()
    try:
        # Check if admin exists
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            admin_user = models.User(
                id=uuid.uuid4(),
                full_name="Platform Admin",
                email=admin_email,
                hashed_password=hash_password(admin_password),
                is_active=True,
                role="superadmin",
                is_admin=True,
                target_role="Platform Administrator",
                experience_level="Executive",
                industry="Software Engineering",
            )
            db.add(admin_user)
            logger.info("Auto-seeded superadmin user: %s", admin_email)

        # Check if ops admin exists
        if not db.query(models.User).filter(models.User.email == ops_admin_email).first():
            db.add(models.User(
                id=uuid.uuid4(),
                full_name="Operations Admin",
                email=ops_admin_email,
                hashed_password=hash_password(ops_admin_password),
                is_active=True,
                role="admin",
                is_admin=True,
                target_role="Operations Manager",
                experience_level="Senior",
                industry="Operations",
            ))

        # Check if moderator exists
        if not db.query(models.User).filter(models.User.email == moderator_email).first():
            db.add(models.User(
                id=uuid.uuid4(),
                full_name="Content & Feedback Moderator",
                email=moderator_email,
                hashed_password=hash_password(moderator_password),
                is_active=True,
                role="moderator",
                is_admin=True,
                target_role="Moderator",
                experience_level="Mid",
                industry="Quality Assurance",
            ))

        # Check if demo user exists
        if not db.query(models.User).filter(models.User.email == demo_email).first():
            db.add(models.User(
                id=uuid.uuid4(),
                full_name="Demo User",
                email=demo_email,
                hashed_password=hash_password(demo_password),
                is_active=True,
                role="user",
                is_admin=False,
                target_role="Software Engineer",
                experience_level="mid",
                industry="Technology",
            ))

        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning("Auto-seed error on startup: %s", e)
    finally:
        db.close()


# Docs are useful in dev but shouldn't be publicly exposed in production.
docs_enabled = settings.environment.lower() != "production"

app = FastAPI(
    title="AI Career Intelligence Platform API",
    version="0.1.0",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)

@app.on_event("startup")
def on_startup():
    auto_seed_database_if_needed()

import os
os.makedirs("static/uploads", exist_ok=True)

is_prod = settings.environment.lower() == "production"

allowed_origins_list = list(set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://careerplatform-three.vercel.app",
    settings.frontend_origin
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)





import hmac
import hashlib

EXEMPT_CSRF_PATHS = {
    "/auth/login",
    "/auth/register",
    "/auth/google-login",
    "/auth/csrf",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/admin/auth/login",
    "/feedback",
    "/health",
    "/"
}

@app.middleware("http")
async def verify_csrf_token(request: Request, call_next):
    # Exempt GET, HEAD, OPTIONS
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return await call_next(request)

    # Exempt public auth entry paths
    if request.url.path in EXEMPT_CSRF_PATHS or any(request.url.path.startswith(p) for p in EXEMPT_CSRF_PATHS):
        return await call_next(request)

    header_token = request.headers.get("X-CSRF-Token")
    csrf_cookie = request.cookies.get("csrf_token")
    auth_header = request.headers.get("Authorization")

    # Requests authenticated via explicit Bearer token are safe from ambient cookie CSRF attacks
    if auth_header and auth_header.startswith("Bearer "):
        return await call_next(request)

    if not header_token and not csrf_cookie:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"detail": "CSRF verification failed: missing CSRF token header or cookie."}
        )

    if csrf_cookie and header_token:
        parts = csrf_cookie.split(".", 1)
        if len(parts) == 2:
            cookie_token, cookie_signature = parts[0], parts[1]
            expected_signature = hmac.new(
                settings.jwt_secret_key.encode("utf-8"),
                cookie_token.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()

            if hmac.compare_digest(cookie_signature, expected_signature):
                if not hmac.compare_digest(header_token, cookie_token):
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"detail": "CSRF verification failed: token mismatch."}
                    )

    return await call_next(request)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak stack traces / internal details to clients. Log server-side
    # for debugging instead.
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


app.include_router(auth_router.router)
app.include_router(resume_router.router)
app.include_router(studio_router.router)
app.include_router(ai_router.router)
app.include_router(tailor_router.router)
app.include_router(jobs_router.router)
app.include_router(courses_router.router)
app.include_router(analytics_router.router)
app.include_router(roadmap_router.router)
app.include_router(resume_builder_router.router)
app.include_router(admin_router.router)
app.include_router(admin_router.public_feedback_router)
app.include_router(admin_router.public_alerts_router)



@app.get("/health")
def health_check():
    db_ok = True
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
    return {"status": "ok", "db": db_ok}
