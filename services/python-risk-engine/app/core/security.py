"""
Security configuration and utilities including JWT authentication and RBAC.

This module provides:
- Password hashing and verification
- JWT token creation and validation
- Role-based access control (RBAC)
- API key authentication
- Security middleware
"""
import os
import secrets
from datetime import datetime, timedelta
from enum import Enum
from functools import lru_cache
from typing import Any, Callable, Dict, List, Optional, Union

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import (
    APIKeyCookie,
    APIKeyHeader,
    APIKeyQuery,
    HTTPAuthorizationCredentials,
    HTTPBearer,
    OAuth2PasswordBearer,
)
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError, JWTClaimsError
from passlib.context import CryptContext
from pydantic import BaseModel, ValidationError
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings
from app.core.logging import logger
from app.schemas import ErrorResponse

# Password hashing with strong settings
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    # Increase the default hashing rounds for better security
    bcrypt__rounds=14,
)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token",
    auto_error=False,
)

# API Key schemes for different authentication methods
api_key_query = APIKeyQuery(name="api_key", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_cookie = APIKeyCookie(name="api_key", auto_error=False)

# JWT settings
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Security headers
SECURITY_HEADERS = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
}

# Role definitions
class UserRole(str, Enum):
    """User roles with hierarchical permissions."""
    GUEST = "guest"  # Unauthenticated users
    USER = "user"    # Regular authenticated users
    EDITOR = "editor"  # Can manage content
    ADMIN = "admin"    # Full access
    SUPER_ADMIN = "superadmin"  # System-level access

class TokenData(BaseModel):
    """JWT token payload schema."""
    sub: str  # Subject (usually user ID)
    username: str
    email: Optional[str] = None
    roles: List[str] = [UserRole.USER.value]
    scopes: List[str] = []
    is_active: bool = True
    is_verified: bool = False
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None
    jti: Optional[str] = None  # JWT ID for token revocation
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }


class TokenPair(BaseModel):
    """Access and refresh token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES * 60  # in seconds

@lru_cache(maxsize=128)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash with constant-time comparison.
    
    Args:
        plain_password: The plain text password
        hashed_password: The hashed password to verify against
        
    Returns:
        bool: True if the password matches, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Log the error but don't leak information
        logger.warning(f"Password verification failed: {str(e)}")
        # Still return False in case of error to prevent timing attacks
        pwd_context.dummy_verify()
        return False

def get_password_hash(password: str) -> str:
    """
    Generate a secure password hash.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        str: The hashed password
        
    Raises:
        ValueError: If password is empty or too short
    """
    if not password or len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    
    return pwd_context.hash(password)

def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)

def create_jwt_token(
    subject: Union[str, int],
    data: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
    secret_key: Optional[str] = None,
    algorithm: str = JWT_ALGORITHM,
    token_type: str = "access",
) -> str:
    """
    Create a new JWT token.
    
    Args:
        subject: The subject (usually user ID)
        data: Additional data to include in the token
        expires_delta: Optional expiration time delta
        secret_key: Optional override for the secret key
        algorithm: Hashing algorithm to use
        token_type: Type of token (access or refresh)
        
    Returns:
        str: Encoded JWT token
        
    Raises:
        ValueError: If required parameters are missing
    """
    if not subject:
        raise ValueError("Subject is required")
    
    if not secret_key:
        secret_key = settings.SECRET_KEY
        if not secret_key:
            raise ValueError("Secret key is required")
    
    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        if token_type == "refresh":
            expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        else:
            expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Standard claims
    to_encode = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "jti": secrets.token_urlsafe(16),  # Unique token ID
        "type": token_type,
    }
    
    # Add custom claims
    if data:
        to_encode.update(data)
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    try:
        return jwt.encode(
            to_encode,
            secret_key,
            algorithm=algorithm,
        )
    except Exception as e:
        logger.error(f"Failed to create JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create authentication token",
        )


def create_access_token(
    subject: Union[str, int],
    data: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a new access token."""
    return create_jwt_token(
        subject=subject,
        data=data,
        expires_delta=expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(
    subject: Union[str, int],
    data: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a new refresh token."""
    return create_jwt_token(
        subject=subject,
        data={"refresh": True, **(data or {})},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def create_token_pair(
    subject: Union[str, int],
    data: Optional[Dict[str, Any]] = None,
) -> TokenPair:
    """Create a new access and refresh token pair."""
    return TokenPair(
        access_token=create_access_token(subject, data),
        refresh_token=create_refresh_token(subject, data),
    )

async def verify_jwt_token(
    token: str,
    secret_key: Optional[str] = None,
    algorithms: List[str] = None,
    audience: Optional[str] = None,
    issuer: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: The JWT token to verify
        secret_key: Optional override for the secret key
        algorithms: List of allowed algorithms
        audience: Expected audience claim
        issuer: Expected issuer claim
        
    Returns:
        Dict containing the decoded token claims
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authentication token provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    secret_key = secret_key or settings.SECRET_KEY
    algorithms = algorithms or [JWT_ALGORITHM]
    
    try:
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=algorithms,
            audience=audience,
            issuer=issuer,
            options={
                "verify_aud": audience is not None,
                "verify_iss": issuer is not None,
                "verify_exp": True,
                "verify_nbf": True,
                "verify_iat": True,
                "verify_signature": True,
            },
        )
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTClaimsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token claims: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        logger.warning(f"JWT validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during token validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing authentication token",
        )


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    api_key: Optional[str] = Depends(api_key_header),
) -> TokenData:
    """
    Get the current user from a JWT token or API key.
    
    Args:
        token: The JWT token from the Authorization header
        api_key: Optional API key from header
        
    Returns:
        TokenData: The authenticated user's token data
        
    Raises:
        HTTPException: If authentication fails
    """
    # First try API key authentication if provided
    if api_key:
        return await authenticate_api_key(api_key)
    
    # Fall back to JWT authentication
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = await verify_jwt_token(token)
        
        # Check if token is an access token
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Convert to TokenData
        token_data = TokenData(
            sub=payload.get("sub"),
            username=payload.get("username"),
            email=payload.get("email"),
            roles=payload.get("roles", []),
            scopes=payload.get("scopes", []),
            is_active=payload.get("is_active", True),
            is_verified=payload.get("is_verified", False),
            exp=datetime.fromtimestamp(payload["exp"]) if "exp" in payload else None,
            iat=datetime.fromtimestamp(payload["iat"]) if "iat" in payload else None,
            jti=payload.get("jti"),
        )
        
        # Check if user is active
        if not token_data.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Inactive user",
            )
        
        return token_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing authentication",
        )


async def authenticate_api_key(api_key: str) -> TokenData:
    """
    Authenticate using an API key.
    
    Args:
        api_key: The API key to authenticate with
        
    Returns:
        TokenData: The authenticated user's token data
        
    Raises:
        HTTPException: If authentication fails
    """
    # TODO: Implement API key validation against your database or key store
    # This is a simplified example
    if not api_key or not api_key.startswith("sk_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format",
        )
    
    # In a real application, you would validate the API key against a database
    # and load the associated user's permissions
    try:
        # Example: Look up API key in database
        # user = await User.get_by_api_key(api_key)
        # if not user or not user.is_active:
        #     raise HTTPException(status_code=401, detail="Invalid or inactive API key")
        
        # For now, return a mock user with admin privileges
        return TokenData(
            sub="api_key_user",
            username="api_user",
            roles=[UserRole.ADMIN.value],
            scopes=["read", "write"],
            is_active=True,
            is_verified=True,
        )
    except Exception as e:
        logger.error(f"API key authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

# Role-based access control utilities

def has_role(required_role: UserRole) -> Callable[[TokenData], bool]:
    """Check if the user has the required role."""
    def check_role(token_data: TokenData = Depends(get_current_user)) -> bool:
        if not token_data.roles:
            return False
        
        # Convert role strings to UserRole enums for comparison
        user_roles = [UserRole(role) for role in token_data.roles]
        
        # Check if user has the required role or higher
        return any(
            role.value == required_role.value or 
            (role == UserRole.SUPER_ADMIN) or
            (required_role == UserRole.USER and role in [UserRole.EDITOR, UserRole.ADMIN])
            for role in user_roles
        )
    return check_role


def has_any_role(*roles: UserRole) -> Callable[[TokenData], bool]:
    """Check if the user has any of the required roles."""
    def check_any_role(token_data: TokenData = Depends(get_current_user)) -> bool:
        if not token_data.roles:
            return False
        
        user_roles = [UserRole(role) for role in token_data.roles]
        required_roles = set(roles)
        
        return any(
            user_role in required_roles or 
            user_role == UserRole.SUPER_ADMIN or
            (UserRole.USER in required_roles and user_role in [UserRole.EDITOR, UserRole.ADMIN])
            for user_role in user_roles
        )
    return check_any_role


def has_all_roles(*roles: UserRole) -> Callable[[TokenData], bool]:
    """Check if the user has all of the required roles."""
    def check_all_roles(token_data: TokenData = Depends(get_current_user)) -> bool:
        if not token_data.roles:
            return False
        
        user_roles = {UserRole(role) for role in token_data.roles}
        required_roles = set(roles)
        
        # Super admin has all roles
        if UserRole.SUPER_ADMIN in user_roles:
            return True
            
        # If USER is required, EDITOR and ADMIN also satisfy it
        if UserRole.USER in required_roles:
            required_roles.discard(UserRole.USER)
            required_roles.update({UserRole.EDITOR, UserRole.ADMIN})
        
        return required_roles.issubset(user_roles)
    return check_all_roles


# Dependency for requiring authentication
async def get_current_active_user(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Dependency to get the current active user."""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Dependency for requiring admin access
async def get_admin_user(
    current_user: TokenData = Depends(get_current_user)
) -> TokenData:
    """Dependency to require admin access."""
    if not has_role(UserRole.ADMIN)(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user


# Security middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses."""
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        
        # Add security headers
        for header, value in SECURITY_HEADERS.items():
            if header not in response.headers:
                response.headers[header] = value
                
        # Add HSTS header for HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting requests."""
    
    def __init__(
        self,
        app,
        limit: int = 100,
        window: int = 60,  # seconds
        ip_header: Optional[str] = None,
    ):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.ip_header = ip_header
        self.requests = {}
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Get client IP
        if self.ip_header and self.ip_header in request.headers:
            ip = request.headers[self.ip_header].split(",")[0].strip()
        else:
            ip = request.client.host
        
        # Get current timestamp
        now = int(time.time())
        
        # Initialize request count for this IP
        if ip not in self.requests:
            self.requests[ip] = {"count": 0, "window_start": now}
        
        # Reset counter if window has passed
        if now - self.requests[ip]["window_start"] > self.window:
            self.requests[ip] = {"count": 0, "window_start": now}
        
        # Increment request count
        self.requests[ip]["count"] += 1
        
        # Check if rate limit exceeded
        if self.requests[ip]["count"] > self.limit:
            retry_after = self.window - (now - self.requests[ip]["window_start"])
            response = JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": f"Rate limit exceeded. Try again in {retry_after} seconds"
                },
            )
            response.headers["Retry-After"] = str(retry_after)
            return response
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.limit)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.limit - self.requests[ip]["count"])
        )
        response.headers["X-RateLimit-Reset"] = str(
            self.requests[ip]["window_start"] + self.window
        )
        
        return response


def get_secret(secret_name: str, default: Optional[str] = None) -> str:
    """
    Get a secret from environment variables, Docker secrets, or a secret manager.
    
    In production, this should be replaced with a call to a proper secret manager.
    """
    # First try environment variables
    secret = os.getenv(secret_name)
    if secret:
        return secret
    
    # Then try Docker secrets (if running in a container)
    try:
        with open(f"/run/secrets/{secret_name}", "r") as secret_file:
            return secret_file.read().strip()
    except IOError:
        pass
    
    # Fall back to default if provided
    if default is not None:
        return default
    
    # In production, you might want to fetch from a secret manager here
    # Example for AWS Secrets Manager:
    # try:
    #     import boto3
    #     client = boto3.client('secretsmanager')
    #     response = client.get_secret_value(SecretId=secret_name)
    #     return response['SecretString']
    # except Exception as e:
    #     logger.error(f"Failed to fetch secret {secret_name}: {str(e)}")
    
    raise ValueError(f"Secret {secret_name} not found and no default provided")
