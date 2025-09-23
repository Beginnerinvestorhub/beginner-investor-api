"""Pydantic models for authentication and user management."""
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator, validator

from app.core.security import UserRole
from app.schemas.common import BaseModelWithID

# Request Models
class TokenRequest(BaseModel):
    """Request model for obtaining an access token."""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")
    grant_type: str = Field("password", description="OAuth2 grant type")
    scope: str = Field("", description="Requested scopes (space-separated)")
    client_id: Optional[str] = Field(None, description="OAuth2 client ID")
    client_secret: Optional[str] = Field(None, description="OAuth2 client secret")

class TokenRefreshRequest(BaseModel):
    """Request model for refreshing an access token."""
    refresh_token: str = Field(..., description="Refresh token")
    grant_type: str = Field("refresh_token", description="Must be 'refresh_token'")
    scope: Optional[str] = Field(None, description="Requested scopes (space-separated)")

class UserCreate(BaseModel):
    """Request model for user registration."""
    email: EmailStr = Field(..., description="User's email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    full_name: Optional[str] = Field(None, max_length=100, description="User's full name")
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Ensure password meets security requirements."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

class UserUpdate(BaseModel):
    """Request model for updating user information."""
    email: Optional[EmailStr] = Field(None, description="New email address")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="New username")
    full_name: Optional[str] = Field(None, max_length=100, description="New full name")
    current_password: Optional[str] = Field(None, description="Current password for verification")
    new_password: Optional[str] = Field(None, min_length=8, description="New password")
    
    @validator('new_password')
    def validate_new_password(cls, v, values):
        """Validate new password if provided."""
        if v is not None and 'current_password' not in values:
            raise ValueError('Current password is required to change password')
        if v is not None and len(v) < 8:
            raise ValueError('New password must be at least 8 characters long')
        return v

class APIKeyCreate(BaseModel):
    """Request model for creating a new API key."""
    name: str = Field(..., min_length=3, max_length=100, description="Name for the API key")
    expires_at: Optional[datetime] = Field(None, description="Expiration date (optional)")
    scopes: List[str] = Field(default_factory=list, description="List of allowed scopes")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

# Response Models
class TokenResponse(BaseModel):
    """Response model for token endpoints."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(..., description="Time until token expiration in seconds")
    refresh_token: Optional[str] = Field(None, description="Refresh token (if supported)")
    scope: str = Field("", description="Granted scopes (space-separated)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600,
                "refresh_token": "def456...",
                "scope": "read write"
            }
        }

class UserResponse(BaseModelWithID):
    """Response model for user information."""
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    roles: List[str] = Field(default_factory=lambda: [UserRole.USER.value])
    metadata: Dict[str, Any] = Field(default_factory=dict)
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
        }

class APIKeyResponse(BaseModelWithID):
    """Response model for API key information."""
    name: str
    prefix: str
    scopes: List[str]
    is_active: bool
    expires_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
        }

class APIKeyWithToken(APIKeyResponse):
    """Response model with the API key (only shown once)."""
    key: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "My API Key",
                "prefix": "sk_abc123",
                "key": "sk_abc123_xyz789...",  # Only shown on creation
                "scopes": ["read", "write"],
                "is_active": True,
                "expires_at": "2023-12-31T23:59:59Z",
                "created_at": "2023-01-01T00:00:00Z"
            }
        }

# Query Parameters
class UserFilter(BaseModel):
    """Query parameters for filtering users."""
    email: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    search: Optional[str] = None
    
    @validator('role')
    def validate_role(cls, v):
        """Validate role against allowed values."""
        if v is not None and v not in [role.value for role in UserRole]:
            raise ValueError(f"Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}")
        return v

# Webhook Events
class AuthEventType(str, Enum):
    """Types of authentication events."""
    USER_REGISTERED = "user.registered"
    USER_VERIFIED = "user.verified"
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    PASSWORD_CHANGED = "user.password_changed"
    PASSWORD_RESET_REQUESTED = "user.password_reset_requested"
    API_KEY_CREATED = "api_key.created"
    API_KEY_REVOKED = "api_key.revoked"

class AuthEvent(BaseModel):
    """Authentication event payload."""
    event: AuthEventType
    user_id: UUID
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
