import os
import sys
import uvicorn

# Ensure both backend and root are on sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "CareerPilot.AI", "backend")
if os.path.exists(backend_dir):
    sys.path.insert(0, backend_dir)
sys.path.insert(0, root_dir)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    workers = int(os.environ.get("WEB_CONCURRENCY", "2"))
    print(f"--> [CareerPilot Root Runner] Starting FastAPI on 0.0.0.0:{port} with {workers} workers")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, workers=workers, log_level="info")
