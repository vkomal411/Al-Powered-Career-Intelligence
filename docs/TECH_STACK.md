# Tech Stack — AI-Powered Career Intelligence Platform

## Frontend
| Component | Technology |
|---|---|
| Framework | Next.js 14 (React 18, TypeScript) |
| Styling | Inline styles for MVP (can migrate to Tailwind CSS later) |
| Auth | JWT stored in `localStorage` + Google Identity Services (Google Sign-In) |
| HTTP Client | Native `fetch` wrapped in `lib/api.ts` |

## Backend
| Component | Technology |
|---|---|
| Framework | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL |
| Auth | JWT (python-jose) + bcrypt password hashing (passlib) + Google OAuth2 (google-auth) |
| Resume Parsing | pdfplumber (PDF), python-docx (DOCX), regex-based email/phone extraction, keyword-based skill extraction |
| Migrations | Alembic (planned — currently using `Base.metadata.create_all`) |

## Authentication Flow
1. **Email/Password**: User registers → password hashed with bcrypt → stored in PostgreSQL → JWT issued on login.
2. **Google Sign-In**: Frontend uses Google Identity Services to get an `id_token` → sent to backend `/auth/google-login` → backend verifies token with Google's public keys → creates or links a `User` row → JWT issued.
3. All protected routes (`/auth/me`, `/resume/upload`, `/resume/my-resumes`) require `Authorization: Bearer <JWT>`.

## Resume Parser (v1)
- Accepts PDF or DOCX.
- Extracts raw text.
- Extracts email and phone via regex.
- Extracts skills via keyword matching against a starter list (~45 common tech/soft skills).
- Stored per-user in the `resumes` table, linked via `user_id`.
- **Future improvement**: replace keyword matching with NLP/NER (spaCy) or an LLM-based extractor for higher accuracy, and add ATS scoring per the original architecture plan.

## Database Schema (Milestone 1)
**`users`**
- id (UUID, PK)
- full_name
- email (unique)
- hashed_password (nullable — null for Google-only accounts)
- google_id (nullable, unique)
- is_active
- created_at

**`resumes`**
- id (UUID, PK)
- user_id (FK → users.id)
- original_filename
- raw_text
- extracted_email
- extracted_phone
- extracted_skills (JSON array)
- uploaded_at

## Environment Variables
See `backend/.env.example` and `frontend/.env.local.example`.
