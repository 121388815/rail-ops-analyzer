import os
from dataclasses import dataclass


def _as_bool(value: str) -> bool:
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("APP_NAME", "RailOps Analyzer API")
    app_version: str = os.getenv("APP_VERSION", "0.1.0")
    debug: bool = _as_bool(os.getenv("DEBUG", "false"))


settings = Settings()

