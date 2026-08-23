import os
import sys
import uuid
from datetime import datetime, timezone

# Add parent directory to path so app imports work cleanly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth_utils import hash_password
from sqlalchemy import text


def seed_database():
    print("Initializing database tables & column migrations...")
    # Add new columns to existing users table if they don't exist yet
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_is_admin ON users (is_admin);"))

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@careerpilot.ai")
        admin_password = os.getenv("ADMIN_INITIAL_PASSWORD")
        if not admin_password:
            if os.getenv("ENVIRONMENT", "development").lower() == "production":
                import secrets
                admin_password = secrets.token_urlsafe(16) + "!Aa1"
                print(f"Generated secure initial admin password for production: {admin_password}")
            else:
                admin_password = "AdminPass123!"

        # 1. Seed / Elevate Superadmin User
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
            print(f"Created Superadmin user: {admin_email}")
        else:
            admin_user.role = "superadmin"
            admin_user.is_admin = True
            admin_user.is_active = True
            print(f"Elevated user {admin_email} to superadmin.")
        
        db.commit()
        db.refresh(admin_user)

        # 2. Seed Sample Job Descriptions
        if db.query(models.JobDescription).count() == 0:
            sample_jds = [
                models.JobDescription(
                    title="Senior Full Stack Engineer",
                    company="TechCorp Solutions",
                    raw_text="We are seeking a Senior Full Stack Engineer with expertise in Next.js, TypeScript, Python, FastAPI, and PostgreSQL. Experience with cloud deployments (AWS/Docker) and CI/CD pipelines is highly desired.",
                    required_skills=["Next.js", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
                    is_active=True,
                    created_by=admin_user.id,
                ),
                models.JobDescription(
                    title="AI/ML Engineer",
                    company="NeuralMind Analytics",
                    raw_text="Join our AI research team to build cutting-edge LLM applications and resume analytics engines. Must be proficient in Python, PyTorch/TensorFlow, NLP, LangChain, and RESTful API development.",
                    required_skills=["Python", "Machine Learning", "NLP", "LangChain", "PyTorch", "FastAPI"],
                    is_active=True,
                    created_by=admin_user.id,
                ),
                models.JobDescription(
                    title="Product Manager - AI Platform",
                    company="Innovate AI",
                    raw_text="Drive the product roadmap for AI career intelligence. Requires strong skills in agile project management, user analytics, ATS optimization algorithms, and technical storytelling.",
                    required_skills=["Product Management", "Agile", "User Research", "Data Analytics", "ATS Optimization"],
                    is_active=True,
                    created_by=admin_user.id,
                ),
            ]
            db.add_all(sample_jds)
            print("Seeded sample Job Descriptions.")

        # 3. Seed Sample Course Catalog
        if db.query(models.CourseCatalog).count() == 0:
            sample_courses = [
                models.CourseCatalog(
                    title="Advanced Next.js 14 & React Architecture",
                    provider="Frontend Masters",
                    url="https://frontendmasters.com/courses/next-js-v14/",
                    skill_tags=["Next.js", "React", "TypeScript", "Frontend Architecture"],
                    category="Web Development",
                ),
                models.CourseCatalog(
                    title="FastAPI & Microservices with Python",
                    provider="Udemy",
                    url="https://udemy.com/course/fastapi-python-microservices/",
                    skill_tags=["FastAPI", "Python", "AsyncIO", "REST API"],
                    category="Backend Engineering",
                ),
                models.CourseCatalog(
                    title="Practical LLMs & Prompt Engineering",
                    provider="DeepLearning.AI",
                    url="https://deeplearning.ai/courses/prompt-engineering/",
                    skill_tags=["Python", "NLP", "LangChain", "Machine Learning"],
                    category="Artificial Intelligence",
                ),
            ]
            db.add_all(sample_courses)
            print("Seeded sample Course Catalog items.")

        # 4. Seed Sample User Feedback
        if db.query(models.UserFeedback).count() == 0:
            sample_feedback = [
                models.UserFeedback(
                    category="feature",
                    rating=5,
                    message="Love the ATS Score comparison breakdown! Could you add a PDF download for the tailored resume?",
                    status="new",
                ),
                models.UserFeedback(
                    category="bug",
                    rating=4,
                    message="Minor typo in the course recommendation card when hovering over skill gap pills.",
                    status="in_progress",
                    admin_response="Investigating component tooltips.",
                ),
                models.UserFeedback(
                    category="rating",
                    rating=5,
                    message="CareerPilot AI helped me land 3 interviews in two weeks!",
                    status="closed",
                    admin_response="Thank you for your feedback!",
                    resolved_at=datetime.now(timezone.utc),
                ),
            ]
            db.add_all(sample_feedback)
            print("Seeded sample User Feedback entries.")

        # 5. Seed Sample System Alerts
        if db.query(models.SystemAlert).count() == 0:
            sample_alerts = [
                models.SystemAlert(
                    title="System Maintenance Scheduled",
                    message="Routine database maintenance will occur on Sunday at 02:00 UTC. Expect 5 minutes of read-only access.",
                    severity="info",
                    is_broadcast=True,
                    created_by=admin_user.id,
                ),
            ]
            db.add_all(sample_alerts)
            print("Seeded sample System Alerts.")

        db.commit()
        print("Database seed completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
