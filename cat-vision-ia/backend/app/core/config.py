from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "CAT Vision IA"
    debug: bool = False
    database_url: str = Field(
        default="sqlite:///./data/catvision.db",
        alias="DATABASE_URL",
    )
    cors_origins: str = Field(
        default="http://localhost:5173",
        alias="CORS_ORIGINS",
    )
    upload_dir: str = Field(default="./data/uploads", alias="UPLOAD_DIR")
    max_upload_mb: int = Field(default=25, alias="MAX_UPLOAD_MB")
    brasil_api_base: str = Field(
        default="https://brasilapi.com.br/api",
        alias="BRASIL_API_BASE",
    )
    cnpj_request_timeout_seconds: float = Field(
        default=8.0,
        alias="CNPJ_REQUEST_TIMEOUT_SECONDS",
    )
    ocr_primary: str = Field(default="auto", alias="OCR_PRIMARY")
    use_docling: bool = Field(default=False, alias="USE_DOCLING")
    tesseract_cmd: str = Field(default="", alias="TESSERACT_CMD")
    mask_logs: bool = Field(default=True, alias="MASK_LOGS")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

