from functools import lru_cache
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_username: str = "guest"
    rabbitmq_password: str = "guest"
    rabbitmq_virtual_host: str = "/"
    rabbitmq_processing_queue: str = "consultation.processing"
    rabbitmq_heartbeat_seconds: int = 60
    rabbitmq_blocked_connection_timeout_seconds: int = 300
    rabbitmq_connection_attempts: int = 3
    rabbitmq_connection_retry_delay_seconds: int = 5
    rabbitmq_reconnect_delay_seconds: int = 5

    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str
    database_username: str
    database_password: str

    file_storage_root: str

    whisper_model_size: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        username = quote_plus(self.database_username)
        password = quote_plus(self.database_password)

        return (
            f"postgresql+psycopg://{username}:{password}"
            f"@{self.database_host}:{self.database_port}"
            f"/{self.database_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()