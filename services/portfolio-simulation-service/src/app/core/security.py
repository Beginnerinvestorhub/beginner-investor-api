"""Security utilities for the Portfolio Simulation Service."""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError

from .config import settings

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    auto_error=False
)

def create_access_token(
    subject: str, 
    expires_delta: Optional[timedelta] = None,
    **extra_data: Dict[str, Any]
) -> str:
    """
    Create a JWT access token.
    
    Args:
        subject: The subject of the token (usually user ID)
        expires_delta: Optional expiration time delta
        **extra_data: Additional data to include in the token
        
    Returns:
        str: Encoded JWT token
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow(),
        "jti": str(hash(f"{subject}{datetime.utcnow().timestamp()}")),
        **extra_data
    }
    
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

async def verify_token(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Dict containing the token payload if valid
        
    Raises:
        HTTPException: If the token is invalid or expired
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}
        )
        
        # Check token expiration
        if datetime.fromtimestamp(payload["exp"]) < datetime.utcnow():
            raise credentials_exception
            
        return payload
        
    except (JWTError, ValidationError):
        raise credentials_exception

def get_current_user_id(token: Dict[str, Any] = Depends(verify_token)) -> str:
    """
    Get the current user ID from the token.
    
    Args:
        token: The decoded JWT token
        
    Returns:
        str: The user ID
        
    Raises:
        HTTPException: If the token is invalid or missing user ID
    """
    user_id = token.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id

def get_current_user_roles(token: Dict[str, Any] = Depends(verify_token)) -> list:
    """
    Get the user roles from the token.
    
    Args:
        token: The decoded JWT token
        
    Returns:
        list: List of user roles
    """
    return token.get("roles", [])
