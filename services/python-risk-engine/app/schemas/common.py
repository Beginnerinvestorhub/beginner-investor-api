"""Common Pydantic models and utilities for request/response validation."""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Generic, List, Optional, TypeVar, Union
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator
from pydantic.generics import GenericModel

# Type variables for generic models
T = TypeVar('T')
ID_TYPE = Union[int, str, UUID]

class SortOrder(str, Enum):
    """Sort order for queries."""
    ASC = "asc"
    DESC = "desc"

class StatusResponse(BaseModel):
    """Standard status response."""
    status: str
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    code: str
    details: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_exception(cls, exc: Exception, include_details: bool = False) -> 'ErrorResponse':
        """Create an error response from an exception."""
        details = {
            "type": exc.__class__.__name__,
            "message": str(exc),
        }
        
        if include_details and hasattr(exc, '__traceback__'):
            import traceback
            details["traceback"] = "".join(
                traceback.format_exception(type(exc), exc, exc.__traceback__)
            )
        
        return cls(
            error=str(exc),
            code=getattr(exc, "code", "internal_error"),
            details=details,
        )

class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints."""
    page: int = Field(1, ge=1, description="Page number, starting from 1")
    page_size: int = Field(10, ge=1, le=100, description="Number of items per page")
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: SortOrder = Field(SortOrder.ASC, description="Sort order")
    
    @property
    def offset(self) -> int:
        """Calculate the offset for pagination."""
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        """Get the limit for the query."""
        return self.page_size

class PaginatedResponse(GenericModel, Generic[T]):
    """Paginated response with metadata."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
    
    @classmethod
    def create(
        cls, 
        items: List[T], 
        total: int, 
        page: int, 
        page_size: int
    ) -> 'PaginatedResponse[T]':
        """Create a paginated response."""
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

class TimestampMixin(BaseModel):
    """Mixin for timestamps."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @field_validator('created_at', 'updated_at', mode='before')
    def parse_dates(cls, v):
        """Parse datetime strings."""
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass
        return v

class BaseModelWithID(TimestampMixin):
    """Base model with ID and timestamps."""
    id: ID_TYPE
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
        }

class HTTPValidationError(BaseModel):
    """Validation error response."""
    detail: List[Dict[str, Any]]
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": [
                    {
                        "loc": ["string", 0],
                        "msg": "string",
                        "type": "string"
                    }
                ]
            }
        }

class EmptyResponse(BaseModel):
    """Empty response model."""
    pass
