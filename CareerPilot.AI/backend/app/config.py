from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
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
            raise ValueError(
                "JWT_SECRET_KEY is missing, a known placeholder, or too short (< 32 chars). "
                "Generate a strong secret, e.g.: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        return v


settings = Settings()
