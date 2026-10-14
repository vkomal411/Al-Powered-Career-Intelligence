# Milestone 1 — Summary

## Scope Delivered
- [x] Registration Page (Next.js) — email/password + Google Sign-Up
- [x] Login Page (Next.js) — email/password + Google Sign-In
- [x] Database — PostgreSQL schema for `users` and `resumes` via SQLAlchemy models
- [x] Resume Parser — extracts text, email, phone, and skills from PDF/DOCX resumes
- [x] Tech Stack — finalized and documented (see `TECH_STACK.md`)

## What's Working End-to-End
1. A user registers or signs up with Google → account created in PostgreSQL.
2. User logs in → receives a JWT.
3. Logged-in user lands on a simple dashboard and uploads a resume (PDF/DOCX).
4. Backend parses the resume and returns extracted email, phone, and skills — stored against that user for later use (skill-gap analysis, career recommendations, etc. in future milestones).

## How to Run Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in DATABASE_URL, JWT_SECRET_KEY, GOOGLE_CLIENT_ID
uvicorn app.main:app --reload
```
API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm run dev
```
App runs at `http://localhost:3000`.

### Database
Create the PostgreSQL database referenced in `DATABASE_URL` before starting the backend:
```bash
createdb career_platform
```
Tables are auto-created on backend startup for this milestone (via `Base.metadata.create_all`). Alembic migrations can be introduced in the next milestone for schema versioning.

### Google OAuth Setup
1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Add `http://localhost:3000` to Authorized JavaScript origins.
4. Copy the Client ID into both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env.local` (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

## Known Limitations / Next Steps
- Skill extraction is keyword-based (v1) — plan to upgrade to spaCy NER or LLM-based extraction in a later milestone, per the original AI/ML Engine design.
- No refresh-token rotation yet — JWT is long-lived (24h) for MVP simplicity.
- No file storage for the original resume file itself, only extracted text/data — add S3/local storage if the original file needs to be retained.
- Alembic migrations not yet wired in — schema currently created via `create_all`.
