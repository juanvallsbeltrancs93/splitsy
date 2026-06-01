from functools import lru_cache

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class ApiSettings(BaseSettings):
    access_token_expire_minutes: int = 15
    algorithm: str = "HS256"
    refresh_token_expire_days: int = 7
    api_base_url: str = "http://0.0.0.0:8000"
    api_prefix: str = "/api/splitsy"
    app_name: str = "Splitsy"
    app_version: str = "V0"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    env: str = "development"
    logs_dir: str = "logs"
    secret_key: str = "development_secret"

    database_uri: str = "sqlite+aiosqlite:///:memory:"

    model_config = ConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_api_settings() -> ApiSettings:
    return ApiSettings()
