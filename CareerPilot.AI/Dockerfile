version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: career_platform
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/career_platform
      - ENVIRONMENT=production
      - FRONTEND_ORIGIN=http://localhost:3000
      - JWT_SECRET_KEY=${JWT_SECRET_KEY:-change-this-to-a-secure-random-string-at-least-32-chars}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/static/uploads

  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_BASE: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
  uploads:
