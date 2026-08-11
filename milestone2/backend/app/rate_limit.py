"""
Minimal in-memory rate limiter for auth endpoints.

This protects a single-process dev/demo deployment against brute-force
login/register attempts. It is intentionally dependency-free.

IMPORTANT (production note): this state lives in process memory, so it
resets on restart and does NOT work correctly across multiple worker
processes/instances. If you deploy with more than one uvicorn/gunicorn
worker or scale horizontally, replace this with a shared store (e.g.
Redis) or a proper library such as slowapi + a Redis backend.
"""

import time
import threading
from typing import Optional
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.config import settings

_lock = threading.Lock()
_attempts: dict[str, deque] = defaultdict(deque)


def _client_key(request: Request, bucket: str) -> str:
    client_ip = request.client.host if request.client else "unknown"
    return f"{bucket}:{client_ip}"


def rate_limit(bucket: str, limit: Optional[int] = None, window: Optional[int] = None):
    """
    Returns a FastAPI dependency that limits requests per client IP to
    `limit` within a rolling window of `window` seconds, scoped per `bucket`.

    Strict security limits are applied by default for auth endpoints, while data/query
    fetching endpoints receive a higher capacity window for seamless UI interactions.
    """

    def dependency(request: Request) -> None:
        key = _client_key(request, bucket)
        now = time.monotonic()
        win = window if window is not None else settings.login_rate_limit_window_seconds

        if limit is not None:
            lim = limit
        elif bucket in {"login", "register", "google-login", "resume-upload"}:
            lim = settings.login_rate_limit_attempts
        else:
            # Generous rate limit for general data fetching & interactive filtering endpoints
            lim = 120

        with _lock:
            attempts = _attempts[key]
            while attempts and now - attempts[0] > win:
                attempts.popleft()

            if len(attempts) >= lim:
                retry_after = max(1, int(win - (now - attempts[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )

            attempts.append(now)

    return dependency

