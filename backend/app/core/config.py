import os
from typing import List, Union
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_default_db_path = os.path.join(_backend_dir, "phishing_defense.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Phishing Defense Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(
        default="supersecretjwtkeyforaiphishingdefenseplatform",
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY")
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30 # 30 days
    DATABASE_URL: str = f"sqlite:///{_default_db_path}"
    
    # Allowed CORS Origins: comma-separated string or array
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://10.0.2.2:5173"
    
    # Environment & Host
    ENVIRONMENT: str = "production"
    PORT: int = 8000

    # Admin seed defaults
    ADMIN_EMAIL: str = "admin@phishguard.ai"
    ADMIN_PASSWORD: str = "AdminPassword123!"

    # Email SMTP (optional)
    SMTP_SERVER: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "alerts@phishguard.ai"

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=os.path.join(_backend_dir, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
