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

# Docs are useful in dev but shouldn't be publicly exposed in production.
docs_enabled = settings.environment.lower() != "production"

app = FastAPI(
    title="AI Career Intelligence Platform API",
    version="0.1.0",
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)

import os
os.makedirs("static/uploads", exist_ok=True)

is_prod = settings.environment.lower() == "production"

allowed_origins_list = (
    [settings.frontend_origin]
    if is_prod
    else list(set([
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        settings.frontend_origin
    ]))
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_origin_regex=None if is_prod else r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
        "font-src 'self' fonts.gstatic.com data:; "
        "img-src 'self' data: blob:; "
        f"connect-src 'self' accounts.google.com {settings.frontend_origin} http://localhost:8000 http://localhost:3000 http://127.0.0.1:8000 http://127.0.0.1:3000; "
        "frame-ancestors 'none';"
    )
    
    if is_prod:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
    return response


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
    "/feedback"
}

@app.middleware("http")
async def verify_csrf_token(request: Request, call_next):
    # Exempt GET, HEAD, OPTIONS
    if request.method in {"GET", "HEAD", "OPTIONS"}:
        return await call_next(request)

    # Exempt public auth entry paths
    if request.url.path in EXEMPT_CSRF_PATHS:
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
    return {"status": "ok"}
