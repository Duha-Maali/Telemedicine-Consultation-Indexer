from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import Settings


class Database:
    def __init__(self, settings: Settings) -> None:
        self._engine = create_engine(
            settings.database_url,
            pool_pre_ping=True,
        )

        self._session_factory = sessionmaker(
            bind=self._engine,
            autoflush=False,
            expire_on_commit=False,
            class_=Session,
        )

    def create_session(self) -> Session:
        return self._session_factory()

    def test_connection(self) -> None:
        with self._engine.connect():
            pass

    def dispose(self) -> None:
        self._engine.dispose()