import os
import sys
import uvicorn

# Ensure the backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"--> [CareerPilot Server] Binding to 0.0.0.0:{port}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, log_level="info")
