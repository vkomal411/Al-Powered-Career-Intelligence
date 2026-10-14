# Deployment Guide

This guide provides complete instructions for deploying the Career Platform application, using Docker Compose or manual setup.

## 1. Prerequisites

Before deploying the application, ensure your environment meets the following requirements:

- **Docker & Docker Compose**: Docker Engine 20.10+ and Docker Compose 2.0+ (for containerized deployment)
- **Node.js**: Version 20.x or higher (for frontend local development/builds)
- **Python**: Version 3.11 or higher (for backend local development)
- **PostgreSQL**: Version 16 or higher (for database hosting)

---

## 2. Quick Start with Docker Compose

The fastest way to spin up the full application stack (PostgreSQL database, FastAPI backend, and Next.js frontend) is using Docker Compose.

```bash
# Navigate to milestone2 root
cd milestone2

# Build and start all services in detached mode
docker-compose up --build -d

# Verify container status
docker-compose ps

# View service logs
docker-compose logs -f
```

Once running:
- **Frontend App**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:8000`
- **PostgreSQL Database**: Accessible at `localhost:5432`

---

## 3. Manual Setup

If you prefer deploying services individually without Docker Compose:

### 3.1 Backend Setup
```bash
cd backend

# Create and activate a Python 3.11 virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3.2 Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm ci

# Build Next.js application
NEXT_PUBLIC_API_BASE=http://localhost:8000 npm run build

# Start production frontend server
npm start
```

### 3.3 Database Setup
Ensure PostgreSQL 16 is running, create the target database and user, and configure `DATABASE_URL` accordingly:
```sql
CREATE USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE career_platform OWNER postgres;
```

---

## 4. Environment Variables Reference

The following environment variables control system runtime behavior:

| Variable | Description | Default / Example | Required |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (SQLAlchemy format) | `postgresql+psycopg://postgres:postgres@localhost:5432/career_platform` | Yes |
| `JWT_SECRET_KEY` | Secret key used for signing JWT tokens | `min-32-char-random-string` | Yes (in Production) |
| `ENVIRONMENT` | Deployment stage environment (`development`, `production`, `testing`) | `production` | Yes |
| `FRONTEND_ORIGIN` | Allowed CORS origin for frontend requests | `http://localhost:3000` | Yes |
| `AI_PROVIDER` | AI service provider used for intelligence features (`gemini`, `openai`, `mock`) | `gemini` | No |
| `GEMINI_API_KEY` | API Key for Google Gemini integrations | `your-gemini-api-key` | Optional |

---

## 5. Database Migrations

Database schema changes are managed using Alembic.

```bash
cd backend

# Apply all pending migrations to the latest version
alembic upgrade head

# Rollback the last migration (if needed)
alembic downgrade -1

# Create a new migration script after schema changes
alembic revision --autogenerate -m "describe_changes"
```

---

## 6. Production Checklist

Before going live in a production environment, complete the following items:

1. **Environment Configuration**: Set `ENVIRONMENT=production`.
2. **Secure JWT Key**: Generate a cryptographically strong random secret key for `JWT_SECRET_KEY` (minimum 32 characters). Do not use default or fallback values.
3. **CORS Origins**: Configure `FRONTEND_ORIGIN` to match your actual production domain (e.g., `https://yourdomain.com`).
4. **TLS/SSL Certificates**: Secure all incoming traffic using HTTPS (e.g., configure Nginx, Caddy, or Cloudflare with SSL certs).
5. **Production WSGI Server**: In production, launch the Python backend with Gunicorn managing multiple Uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```
