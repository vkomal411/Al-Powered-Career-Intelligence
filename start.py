import os
import sys

# Ensure working directory is backend so all relative imports and paths work
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if os.path.isdir(backend_dir):
    os.chdir(backend_dir)
    sys.path.insert(0, backend_dir)

import start

if __name__ == "__main__":
    start.ensure_directories()
    start.run_migrations_if_configured()
    port = int(os.environ.get("PORT", 10000))
    workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
    print(f"--> [CareerPilot Server] Root launcher binding to 0.0.0.0:{port} with {workers} worker(s)")
    start.uvicorn.run("app.main:app", host="0.0.0.0", port=port, workers=workers, log_level="info")
