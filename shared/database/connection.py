from typing import Generator
from contextlib import contextmanager
import os
import time
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from ..config import get_database_config

<<<<<<< HEAD
# Get database configuration from centralized config
db_config = get_database_config()
DATABASE_URL = db_config['url']

# Create SQLAlchemy engine with connection pooling and retry logic
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(Exception)
=======
# Create SQLAlchemy engine with connection pooling optimized for PostgreSQL
engine = create_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+psycopg://"), 
    poolclass=QueuePool,
    pool_size=5,  # Number of connections to keep open
    max_overflow=10,  # Number of connections to create beyond pool_size
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True,  # Enable connection health checks
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",  # Enable SQL logging if needed
>>>>>>> 94d29dab5d0cdd4270ed4b59294550e80e0283e7
)
def create_database_engine():
    """Create database engine with retry logic"""
    try:
        engine = create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=db_config['pool_size'],
            max_overflow=db_config['max_overflow'],
            pool_timeout=db_config['pool_timeout'],
            pool_recycle=db_config['pool_recycle'],
            pool_pre_ping=True,
            echo=db_config['echo'],
            connect_args={
                "connect_timeout": 10,
                "application_name": "investment-hub",
            }
        )
        return engine
    except Exception as e:
        print(f"Failed to create database engine: {e}")
        raise

engine = create_database_engine()

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get a database session.
    Use this in FastAPI route dependencies.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection() -> bool:
    """
    test database connection and return True if successful.
    """
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def create_tables():
    """
    Create all database tables defined in the models.
    """
    from .models.base import Base
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """
    Drop all database tables (use with caution!).
    """
    from .models.base import Base
    Base.metadata.drop_all(bind=engine)

def init_db() -> None:
    """Initialize the database by creating all tables."""
    from .models import Base  # Import models to register them with SQLAlchemy
    Base.metadata.create_all(bind=engine)

def get_db_url() -> str:
    """Get the database URL with sensitive information redacted."""
    if not DATABASE_URL:
        return "Not configured"

    # Redact password from the URL for logging
    if "@" in DATABASE_URL and "://" in DATABASE_URL:
        protocol, rest = DATABASE_URL.split("://", 1)
        if "@" in rest:
            user_pass, host = rest.split("@", 1)
            if ":" in user_pass:
                user = user_pass.split(":", 1)[0]
                return f"{protocol}://{user}:****@{host}"
    return DATABASE_URL
