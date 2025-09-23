"""
Database models package.

This package contains all database models and the base model class.
"""
from .base import Base, ModelType

# Import all models here to ensure they are registered with SQLAlchemy
# This must be done before the database is initialized
from .user import User  # noqa: F401

# This will be populated by the model modules
__all__ = ["Base", "ModelType", "User"]
