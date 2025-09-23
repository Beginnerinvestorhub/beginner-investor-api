"""Database session management."""
from __future__ import annotations

import contextlib
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Global database engine and session factory
_async_engine: Optional[AsyncEngine] = None
_async_session_factory: Optional[async_sessionmaker] = None


def get_engine() -> AsyncEngine:
    """Get the async database engine, creating it if necessary."""
    global _async_engine
    
    if _async_engine is None:
        _async_engine = create_async_engine(
            settings.DATABASE_URI,
            echo=settings.DEBUG,
            pool_pre_ping=True,  # Enable connection health checks
            pool_recycle=3600,   # Recycle connections after 1 hour
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            connect_args={
                "server_settings": {
                    "application_name": settings.PROJECT_NAME,
                    "statement_timeout": str(int(settings.DB_STATEMENT_TIMEOUT * 1000)),  # ms
                },
                "command_timeout": settings.DB_STATEMENT_TIMEOUT,
            },
        )
    
    return _async_engine


def get_session_factory() -> async_sessionmaker:
    """Get the async session factory, creating it if necessary."""
    global _async_session_factory
    
    if _async_session_factory is None:
        _async_session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )
    
    return _async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    ""
    Dependency that provides a database session.
    
    Example:
        async def some_endpoint(db: AsyncSession = Depends(get_db)):
            # Use the database session
            result = await db.execute("SELECT 1")
            ...
    """
    session_factory = get_session_factory()
    
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Create a global session factory for convenience
async_session_factory = get_session_factory()


@contextlib.asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """Context manager for database sessions."""
    session_factory = get_session_factory()
    
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    ""Initialize database connections and create tables if they don't exist."""
    from app.db import base  # noqa: F401
    
    engine = get_engine()
    
    # Import all models here to ensure they are registered with SQLAlchemy
    from app.models import Base  # noqa: F401
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Run any necessary migrations
    await run_migrations()


async def run_migrations() -> None:
    ""Run database migrations."""
    from alembic import command
    from alembic.config import Config
    
    # Load the Alembic configuration
    alembic_cfg = Config("alembic.ini")
    
    # Run migrations
    command.upgrade(alembic_cfg, "head")


async def close_db() -> None:
    ""Close database connections."""
    global _async_engine, _async_session_factory
    
    if _async_engine:
        await _async_engine.dispose()
        _async_engine = None
    
    _async_session_factory = None
