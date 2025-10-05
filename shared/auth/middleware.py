"""
FastAPI Authentication Middleware
"""
from typing import Callable, Dict, Any, Optional
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import logging

from .firebase_auth import firebase_auth
from ..config import get_config

logger = logging.getLogger(__name__)
config = get_config()

# JWT settings
SECRET_KEY = config.JWT_SECRET_KEY
ALGORITHM = config.JWT_ALGORITHM

security = HTTPBearer(auto_error=False)


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None


async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user if token is provided (optional authentication)"""
    if not credentials:
        return None

    token = credentials.credentials
    payload = verify_token(token)

    if not payload or payload.get("type") != "access":
        return None

    return payload


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user (required authentication)"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """Get current active user"""
    # You can add additional checks here if needed
    # For example, check if user is active in database
    return current_user


async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Get current user if they have admin role"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def require_auth(roles: Optional[list] = None):
    """Decorator to require authentication and specific roles"""
    def decorator(func: Callable) -> Callable:
        async def wrapper(*args, **kwargs):
            # Get current user from kwargs if provided by dependency injection
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )

            # Check roles if specified
            if roles and current_user.get("role") not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


class AuthMiddleware:
    """Authentication middleware class"""

    @staticmethod
    async def authenticate_request(request: Request):
        """Authenticate incoming request"""
        # Skip authentication for certain paths
        skip_paths = ["/docs", "/redoc", "/openapi.json", "/auth/login", "/auth/register"]

        if any(request.url.path.startswith(path) for path in skip_paths):
            return

        # Check for authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization header missing or invalid"
            )

        token = auth_header.split(" ")[1]
        payload = verify_token(token)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

        # Add user info to request state
        request.state.user = payload

    @staticmethod
    async def require_roles(roles: list):
        """Middleware to require specific roles"""
        def decorator(func: Callable) -> Callable:
            async def wrapper(request: Request, *args, **kwargs):
                if not hasattr(request.state, 'user'):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Not authenticated"
                    )

                user_role = request.state.user.get("role")
                if user_role not in roles:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions"
                    )

                return await func(request, *args, **kwargs)
            return wrapper
        return decorator
