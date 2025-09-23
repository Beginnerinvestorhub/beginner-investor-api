from datetime import datetime
from typing import Any, Dict, Optional, Type, TypeVar
from uuid import uuid4

from sqlalchemy import Column, DateTime, String
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import UUID

ModelType = TypeVar("ModelType", bound="Base")

@as_declarative()
class Base:
    """Base class for all database models."""
    
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

    @declared_attr
    def __tablename__(cls) -> str:
        ""
        Generate __tablename__ automatically.
        Converts CamelCase class name to snake_case table name.
        """
        return "".join(["_".join([word.lower() for word in word]) for word in 
                      [('', cls.__name__[0].lower())] + 
                      [('', c) if c.isupper() else (c,) for c in cls.__name__[1:]]])

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
            if getattr(self, column.name) is not None
        }

    @classmethod
    def create(
        cls, db: Session, obj_in: Dict[str, Any], commit: bool = True
    ) -> ModelType:
        """Create a new record in the database."""
        obj_in_data = obj_in.dict() if hasattr(obj_in, "dict") else obj_in
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
        cls, db: Session, *, db_obj: ModelType, obj_in: Dict[str, Any]
    ) -> ModelType:
        """Update a record."""
        obj_data = obj_in.dict() if hasattr(obj_in, "dict") else obj_in
        
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
        obj = db.query(cls).get(id)
        if obj:
            obj.deleted_at = datetime.utcnow()
            db.add(obj)
            db.commit()
            db.refresh(obj)
        return obj
