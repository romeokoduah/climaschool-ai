"""Runtime configuration, read from the environment."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "ClimaSchool AI API"
    environment: str = "production"
    api_prefix: str = "/api/v1"

    # postgresql+psycopg://user:password@host:5432/dbname
    database_url: str = "postgresql+psycopg://climaschool:climaschool@localhost:5432/climaschool"

    # Must be overridden in .env. The app refuses to start in production on the default.
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60 * 12

    # Comma-separated origins allowed to call the API from a browser.
    cors_origins: str = "http://localhost:5173,https://climaschool-ai.vercel.app"

    # Seeded on first boot so there is a way in. Change the password immediately.
    bootstrap_admin_email: str = "ecolutionghana@gmail.com"
    bootstrap_admin_password: str = ""

    # Shared secret for the SMS/USSD gateway webhook. Empty means the webhook
    # fails closed — an unset token must never mean "accept anonymous writes".
    gateway_token: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
