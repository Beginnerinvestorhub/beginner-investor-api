from typing import Generator
from contextlib import contextmanager
import time

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from ..config import get_database_config



# Load configuration
# Get database configuration from centralized config

db_config = get_database_config()
DATABASE_URL = db_config.DATABASE_URL


def create_database_engine():
    """Create database engine with retry and pooling logic."""
    retries = 3
    delay = 2

    for attempt in range(retries):
        try:
            engine = create_engine(
                DATABASE_URL,
                poolclass=QueuePool,
                pool_size=5,
                max_overflow=10,
                pool_timeout=30,
                pool_recycle=1800,
                pool_pre_ping=True,
                echo=False,
                connect_args={
                    "connect_timeout": 10,
                    "application_name": "investment-hub",
                },
            )
            return engine
        except Exception as e:
            print(f"⚠️ Database engine creation failed (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(delay)
            else:
                raise


# Create the engine globally
engine = create_database_engine()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Provide a transactional database session (use with FastAPI dependency injection)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection() -> bool:
    """Test database connection."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


def create_tables():
    """Create all tables."""
    from .models.base import Base
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all tables (use with caution!)."""
    from .models.base import Base
    Base.metadata.drop_all(bind=engine)


def init_db() -> None:
    """Initialize the database."""
    from .models.base import Base
    Base.metadata.create_all(bind=engine)


def get_db_url() -> str:
    """Get redacted DB URL (for logs)."""
    if not DATABASE_URL:
        return "Not configured"

    if "@" in DATABASE_URL and "://" in DATABASE_URL:
        protocol, rest = DATABASE_URL.split("://", 1)
        if "@" in rest:
            user_pass, host = rest.split("@", 1)
            if ":" in user_pass:
                user = user_pass.split(":", 1)[0]
                return f"{protocol}://{user}:****@{host}"
    return DATABASE_URL
