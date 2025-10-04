"""
Simple authentication middleware for behavioral-nudge-engine
"""
from typing import Optional
from fastapi import HTTPException, status, Header
from pydantic import BaseModel

class UserInDB(BaseModel):
    id: str
    email: str
    is_admin: bool = False

def get_current_user(authorization: Optional[str] = Header(None)) -> UserInDB:
    """
    Simple authentication - in production this would validate JWT tokens
    For now, returns a mock user for development
    """
    # In a real implementation, this would:
    # 1. Extract token from Authorization header
    # 2. Validate JWT token
    # 3. Return user information from database

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Mock user for development - in production this would be database lookup
    return UserInDB(
        id="user_123",
        email="user@example.com",
        is_admin=False
    )
