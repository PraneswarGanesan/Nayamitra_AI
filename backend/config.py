from __future__ import annotations
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── OpenRouter ────────────────────────────────────────────────────────────
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-4o-mini"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # ── Database ──────────────────────────────────────────────────────────────
    DB_PATH: Path = BASE_DIR / "data" / "nayamitra.db"
    SUPABASE_URI: str = ""

    # ── Authentication ────────────────────────────────────────────────────────
    JWT_SECRET: str = "super_secret_key_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # ── Feature flags ─────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

settings = Settings()

# Ensure data dirs exist
settings.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
