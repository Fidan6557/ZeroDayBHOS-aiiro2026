from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _env_files() -> list[str]:
    files: list[str] = []
    for parent in Path(__file__).resolve().parents:
        candidate = parent / ".env"
        if candidate.exists():
            files.append(str(candidate))
    files.append(".env")
    return files


class Settings(BaseSettings):
    groq_api_key: str = ""
    groq_api_url: str = "https://api.groq.com/openai/v1/chat/completions"
    groq_model: str = "openai/gpt-oss-20b"
    database_url: str = "sqlite:///./data/agentshield.db"
    api_key: str = ""
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    llm_timeout: float = 10.0
    url_fetch_timeout: float = 10.0
    url_max_bytes: int = 1048576

    model_config = SettingsConfigDict(
        env_file=_env_files(),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
