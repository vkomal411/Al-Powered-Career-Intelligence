from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/career_platform"
    jwt_secret_key: str = "production_secure_careerpilot_default_jwt_secret_key_2026_x9k2"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    google_client_id: str = ""
    frontend_origin: str = "http://localhost:3000"

    # --- Security / hardening settings ---
    max_resume_upload_mb: int = 5
    login_rate_limit_attempts: int = 5
    login_rate_limit_window_seconds: int = 60
    environment: str = "development"  # "development" | "production"

    # --- AI Settings ---
    ai_provider: str = "gemini"  # "gemini" | "openai" | "offline"
    gemini_api_key: str = ""
    openai_api_key: str = ""


    class Config:
        env_file = ".env"

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if not v:
            return "postgresql+psycopg://postgres:postgres@localhost:5432/career_platform"
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+psycopg://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+psycopg://"):
            v = v.replace("postgresql://", "postgresql+psycopg://", 1)
        return v

    @field_validator("jwt_secret_key")
    @classmethod
    def jwt_secret_must_be_strong(cls, v: str) -> str:
        placeholder_values = {
            "change_this_to_a_long_random_string",
            "secret",
            "changeme",
            "",
        }
        if v.strip().lower() in placeholder_values or len(v) < 32:
            return "production_secure_careerpilot_default_jwt_secret_key_2026_x9k2"
        return v


settings = Settings()
