from datetime import datetime
from typing import Any, Dict, Optional, Type, TypeVar
from uuid import uuid4

from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import DeclarativeBase, Session, declared_attr
from sqlalchemy.dialects.postgresql import UUID

ModelType = TypeVar("ModelType", bound="Base")

class Base(DeclarativeBase):
    """Base class for all database models using SQLAlchemy 2.x."""

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        default=uuid4,
        unique=True,
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    deleted_at = Column(DateTime, nullable=True)

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """
        Generate __tablename__ automatically.
        Converts CamelCase class name to snake_case table name.
        """
        name = cls.__name__
        # Handle common patterns like UserProfile -> user_profiles
        import re
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
            if getattr(self, column.name) is not None
        }

    @classmethod
    def create(
        cls, db: Session, obj_in: Dict[str, Any] | Any, commit: bool = True
    ) -> ModelType:
        """Create a new record in the database."""
        if hasattr(obj_in, "dict"):
            # Pydantic v1 compatibility
            obj_in_data = obj_in.dict()
        elif hasattr(obj_in, "model_dump"):
            # Pydantic v2 compatibility
            obj_in_data = obj_in.model_dump()
        else:
            obj_in_data = obj_in

        db_obj = cls(**obj_in_data)
        db.add(db_obj)
        if commit:
            db.commit()
            db.refresh(db_obj)
        return db_obj

    @classmethod
    def get(cls, db: Session, id: str) -> Optional[ModelType]:
        """Get a single record by ID."""
        return db.query(cls).filter(cls.id == id, cls.deleted_at.is_(None)).first()

    @classmethod
    def get_multi(
        cls, db: Session, *, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        """Get multiple records with pagination."""
        return (
            db.query(cls)
            .filter(cls.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
            .all()
        )

    @classmethod
    def update(
        cls, db: Session, *, db_obj: ModelType, obj_in: Dict[str, Any] | Any
    ) -> ModelType:
        """Update a record."""
        if hasattr(obj_in, "dict"):
            obj_data = obj_in.dict()
        elif hasattr(obj_in, "model_dump"):
            obj_data = obj_in.model_dump()
        else:
            obj_data = obj_in

        for field in obj_data:
            if hasattr(db_obj, field) and field != "id":
                setattr(db_obj, field, obj_data[field])

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @classmethod
    def remove(cls, db: Session, *, id: str) -> Optional[ModelType]:
        """Soft delete a record."""
        obj = db.query(cls).filter(cls.id == id).first()
        if obj:
            obj.deleted_at = datetime.utcnow()
            db.add(obj)
            db.commit()
            db.refresh(obj)
        return obj
