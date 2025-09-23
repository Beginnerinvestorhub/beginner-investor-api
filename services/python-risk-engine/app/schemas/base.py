"""Base schemas and validation utilities."""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from uuid import UUID, uuid4

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
    EmailStr,
    HttpUrl,
    AnyHttpUrl,
    AnyUrl,
    field_serializer,
)
from pydantic.functional_validators import AfterValidator
from typing_extensions import Annotated

# Type variables for generic models
T = TypeVar('T')
ID_TYPE = Union[int, str, UUID]

# Custom validators
def validate_not_empty(value: str) -> str:
    """Validate that a string is not empty."""
    if not value or not value.strip():
        raise ValueError("Value cannot be empty")
    return value

# Custom types
NonEmptyStr = Annotated[str, AfterValidator(validate_not_empty)]

class BaseSchema(BaseModel):
    """Base schema with common configuration and methods."""
    
    model_config = ConfigDict(
        from_attributes=True,  # Allow ORM model conversion
        populate_by_name=True,  # Allow aliases
        arbitrary_types_allowed=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
        },
        str_strip_whitespace=True,  # Strip whitespace from strings
        str_min_length=1,  # Don't allow empty strings
        validate_default=True,
        validate_assignment=True,
        extra="forbid",  # Don't allow extra fields
    )
    
    @field_serializer('id')
    def serialize_id(self, id: ID_TYPE, _info) -> str:
        """Convert ID to string for JSON serialization."""
        return str(id)
    
    def model_dump_flat(self, **kwargs) -> Dict[str, Any]:
        ""
        Dump the model to a flat dictionary, removing nested models.
        
        This is useful for creating flat database records or API responses.
        """
        data = self.model_dump(**kwargs)
        result = {}
        
        for key, value in data.items():
            if isinstance(value, (int, float, str, bool, type(None))):
                result[key] = value
            elif isinstance(value, (list, tuple, set)):
                # Handle lists of simple types
                if all(isinstance(x, (int, float, str, bool)) for x in value):
                    result[key] = value
            elif isinstance(value, dict):
                # Handle dicts with simple values
                if all(isinstance(k, str) and isinstance(v, (int, float, str, bool)) 
                       for k, v in value.items()):
                    result[key] = value
            # Skip complex objects
            
        return result
    
    def model_copy(self, **kwargs) -> 'BaseSchema':
        ""Create a copy of the model with updated fields."""
        return self.model_validate(self.model_dump() | kwargs)

class BaseResponse(BaseSchema):
    """Base response schema with common fields."""
    success: bool = True
    message: Optional[str] = None
    
    @classmethod
    def from_error(cls, message: str, **kwargs) -> 'BaseResponse':
        """Create an error response."""
        return cls(success=False, message=message, **kwargs)

class PaginatedResponse(BaseResponse, Generic[T]):
    """Paginated response schema."""
    data: List[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 10
    total_pages: int = 1
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        page_size: int,
        **kwargs
    ) -> 'PaginatedResponse[T]':
        """Create a paginated response."""
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1
        return cls(
            data=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            **kwargs
        )

class ErrorResponse(BaseResponse):
    """Error response schema."""
    error_code: str
    details: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_exception(
        cls,
        exc: Exception,
        error_code: str = "internal_error",
        status_code: int = 500,
        include_details: bool = False,
    ) -> 'ErrorResponse':
        """Create an error response from an exception."""
        details = {
            "type": exc.__class__.__name__,
            "message": str(exc),
        }
        
        if include_details:
            import traceback
            details["traceback"] = traceback.format_exc()
        
        return cls(
            success=False,
            error_code=error_code,
            message=str(exc),
            details=details,
        )

class SortOrder(str, Enum):
    """Sort order for queries."""
    ASC = "asc"
    DESC = "desc"

class QueryParams(BaseModel):
    """Base query parameters for list endpoints."""
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(10, ge=1, le=100, description="Items per page")
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

# Common field types
class EmailField(str):
    """Email field with validation."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not v:
            raise ValueError("Email cannot be empty")
        return EmailStr._validate(v)

class PasswordField(str):
    """Password field with validation."""
    min_length: int = 8
    max_length: int = 128
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not v:
            raise ValueError("Password cannot be empty")
        if len(v) < cls.min_length:
            raise ValueError(f"Password must be at least {cls.min_length} characters")
        if len(v) > cls.max_length:
            raise ValueError(f"Password cannot exceed {cls.max_length} characters")
        return v

# Common response models
class SuccessResponse(BaseResponse):
    """Generic success response."""
    data: Optional[Dict[str, Any]] = None

class ErrorResponseModel(BaseResponse):
    """Generic error response."""
    error: str
    error_code: str
    details: Optional[Dict[str, Any]] = None
    
    @classmethod
    def from_exception(cls, exc: Exception, include_details: bool = False) -> 'ErrorResponseModel':
        """Create an error response from an exception."""
        details = {
            "type": exc.__class__.__name__,
            "message": str(exc),
        }
        
        if include_details:
            import traceback
            details["traceback"] = traceback.format_exc()
        
        return cls(
            success=False,
            error=str(exc),
            error_code=getattr(exc, "error_code", "internal_error"),
            details=details,
        )

# Common request/response models
class IDModel(BaseSchema):
    """Model with a single ID field."""
    id: ID_TYPE

class TimestampMixin(BaseModel):
    """Mixin for created/updated timestamps."""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    @model_validator(mode='before')
    def set_timestamps(cls, values):
        now = datetime.utcnow()
        if 'created_at' not in values:
            values['created_at'] = now
        if 'updated_at' not in values:
            values['updated_at'] = now
        return values
