import os
import sys
import subprocess
import uvicorn

# Ensure the backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def ensure_directories():
    """Ensure static/uploads directory exists."""
    uploads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)


def run_migrations_if_configured():
    """Run alembic migrations automatically on startup if DATABASE_URL is present."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("--> [CareerPilot Server] No DATABASE_URL set; skipping migrations.")
        return

    print("--> [CareerPilot Server] Running database migrations (alembic upgrade head)...")
    try:
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        result = subprocess.run(
            ["alembic", "upgrade", "head"],
            cwd=backend_dir,
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode == 0:
            print("--> [CareerPilot Server] Database migrations applied successfully.")
        else:
            print(f"--> [CareerPilot Server] Alembic notice (exit code {result.returncode}):\n{result.stdout}\n{result.stderr}")
    except Exception as exc:
        print(f"--> [CareerPilot Server] Migration execution notice (non-fatal): {exc}")


if __name__ == "__main__":
    ensure_directories()
    run_migrations_if_configured()

    port = int(os.environ.get("PORT", 10000))
    # Default to 1 worker on Render free tier (512MB RAM) to prevent memory eviction
    workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
    print(f"--> [CareerPilot Server] Binding to 0.0.0.0:{port} with {workers} worker(s)")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, workers=workers, log_level="info")

