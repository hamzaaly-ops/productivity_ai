from __future__ import annotations

from app.database import Base, engine
from app import models  # noqa: F401


def create_database_tables() -> None:
    Base.metadata.create_all(bind=engine)
