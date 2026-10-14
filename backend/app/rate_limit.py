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
import logging
import threading
from typing import Optional
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.config import settings

logger = logging.getLogger("rate_limit")

_lock = threading.Lock()
_attempts: dict[str, deque] = defaultdict(deque)

# Distributed Redis client (optional, activated via REDIS_URL)
_redis_client = None
if getattr(settings, "redis_url", ""):
    try:
        import redis
        _redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        _redis_client.ping()
        logger.info("Distributed Redis rate-limiting backend connected successfully.")
    except Exception as exc:
        logger.warning("Could not initialize Redis rate-limiter (%s). Falling back to in-memory store.", exc)
        _redis_client = None
elif settings.environment.lower() == "production":
    logger.warning("PRODUCTION NOTICE: REDIS_URL is not set. In-memory rate limiting is active and will not synchronize across multi-worker clusters.")


def _client_key(request: Request, bucket: str) -> str:
    client_ip = request.client.host if request.client else "unknown"
    return f"{bucket}:{client_ip}"


def rate_limit(bucket: str, limit: Optional[int] = None, window: Optional[int] = None):
    """
    Returns a FastAPI dependency that limits requests per client IP to
    `limit` within a rolling window of `window` seconds, scoped per `bucket`.

    Automatically switches between distributed Redis sliding-window and in-memory
    lock-protected deque.
    """

    def dependency(request: Request) -> None:
        import os
        if settings.environment.lower() in ("testing", "test") or os.getenv("PYTEST_CURRENT_TEST"):
            return

        key = _client_key(request, bucket)
        win = window if window is not None else settings.login_rate_limit_window_seconds

        if limit is not None:
            lim = limit
        elif bucket in {"login", "register", "google-login", "resume-upload", "forgot-password", "reset-password"}:
            lim = settings.login_rate_limit_attempts
        else:
            # Generous rate limit for interactive querying
            lim = 120

        # Try distributed Redis first if enabled
        if _redis_client is not None:
            try:
                now_epoch = time.time()
                redis_key = f"ratelimit:{key}"
                pipe = _redis_client.pipeline()
                pipe.zremrangebyscore(redis_key, 0, now_epoch - win)
                pipe.zcard(redis_key)
                pipe.zadd(redis_key, {str(now_epoch): now_epoch})
                pipe.expire(redis_key, win + 5)
                res = pipe.execute()
                current_count = res[1]

                if current_count >= lim:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Too many attempts. Please try again later.",
                        headers={"Retry-After": str(win)},
                    )
                return
            except HTTPException:
                raise
            except Exception as e:
                logger.debug("Redis rate-limit check failed (%s), falling back to in-memory.", e)

        # In-memory sliding window fallback
        now = time.monotonic()
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

