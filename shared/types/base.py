from typing import TypeVar, Generic, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

T = TypeVar('T')

class ResponseStatus(str, Enum):
    """Standard response statuses"""
    SUCCESS = "success"
    ERROR = "error"
    PENDING = "pending"
    PARTIAL = "partial"

class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    status: ResponseStatus
    data: Optional[T] = None
    message: Optional[str] = None
    errors: Optional[list[str]] = None
    metadata: Optional[dict[str, Any]] = None
    
    class Config:
        use_enum_values = True

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool

class TimestampMixin(BaseModel):
    """Mixin for timestamp fields"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SoftDeleteMixin(BaseModel):
    """Mixin for soft delete"""
    deleted_at: Optional[datetime] = None
    is_deleted: bool = False