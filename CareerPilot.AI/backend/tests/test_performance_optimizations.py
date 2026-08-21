import time
import concurrent.futures
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.ai.spacy_parser import parse_resume_with_spacy
from app.ai.llm.client import llm_client
from sqlalchemy import text

client = TestClient(app)

def test_health_check_endpoint_speed_and_payload():
    for _ in range(3):
        t0 = time.perf_counter()
        resp = client.get("/health")
        elapsed_ms = (time.perf_counter() - t0) * 1000
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"
        assert "db" in data


def test_spacy_parser_accuracy_and_speed():
    sample_text = (
        "Experienced Full Stack Engineer with proficiency in Python, FastAPI, TypeScript, React, Next.js, "
        "PostgreSQL, Docker, AWS, and Machine Learning. Built CI/CD pipelines and microservices."
    )
    result = parse_resume_with_spacy(sample_text)
    expected_skills = {"Python", "FastAPI", "TypeScript", "React", "Next.js", "PostgreSQL", "Docker", "AWS", "Machine Learning", "CI/CD", "Microservices"}
    found_skills = set(result["skills"])
    missing = expected_skills - found_skills
    assert len(missing) == 0, f"Missing skills: {missing}"


def test_db_connection_pool_concurrency():
    def worker_query(worker_id):
        session = SessionLocal()
        try:
            res = session.execute(text("SELECT 1")).scalar()
            return worker_id, res == 1
        finally:
            session.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker_query, i) for i in range(10)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    assert all(success for _, success in results)
