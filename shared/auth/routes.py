import redis
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
import jwt
import os
from passlib.context import CryptContext
import logging
from datetime import datetime, timedelta

from .firebase_auth import firebase_auth
from .cache_service import AuthCacheService, rate_limit_auth, cache_auth_data
from ..config import get_config
from ..database.connection import SessionLocal
from ..database.models import User
from ..redis.config import get_settings

logger = logging.getLogger(__name__)
config = get_config()
redis_settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = config.JWT_SECRET_KEY
ALGORITHM = config.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES

# Initialize cache service
redis_client = redis.Redis(connection_pool=redis.ConnectionPool(
    host=redis_settings.REDIS_HOST,
    port=redis_settings.REDIS_PORT,
    password=redis_settings.REDIS_PASSWORD,
    db=redis_settings.REDIS_DB,
    decode_responses=True
))
auth_cache = AuthCacheService(redis_client)

router = APIRouter()
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]


class RefreshTokenRequest(BaseModel):
    refresh_token: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=config.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
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
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


def get_db():
    """Database dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login", response_model=TokenResponse)
@rate_limit_auth(max_requests=5, period=300, identifier_func=lambda *args, **kwargs: args[0].email if args and hasattr(args[0], 'email') else "unknown")
async def login(login_data: LoginRequest, response: Response):
    """Firebase authentication login with rate limiting"""
    try:
        # Check cache for user session first
        cached_session = await auth_cache.get_user_session(login_data.email)
        if cached_session:
            logger.info(f"Using cached session for {login_data.email}")
            # Return cached session data
            return TokenResponse(
                access_token=cached_session.get("access_token", ""),
                token_type="bearer",
                expires_in=cached_session.get("expires_in", 0),
                user=cached_session.get("user", {})
            )

        # Check if user exists in our database
        db = SessionLocal()
        user = db.query(User).filter(User.email == login_data.email).first()

        if not user:
            # Create user if doesn't exist
            firebase_user = firebase_auth.create_user(
                email=login_data.email,
                password=login_data.password,
                display_name=f"{login_data.email.split('@')[0]}"
            )

            # Create user in our database
            new_user = User(
                email=login_data.email,
                first_name=login_data.email.split('@')[0],
                last_name="User",
                is_active=True,
                email_verified=False,
                hashed_password=pwd_context.hash(login_data.password),
                firebase_uid=firebase_user["uid"]
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user

        # Verify password (for traditional login)
        if not pwd_context.verify(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        # Create tokens
        token_data = {
            "sub": user.email,
            "user_id": str(user.id),
            "firebase_uid": user.firebase_uid,
            "role": "user"
        }

        access_token = create_access_token(
            token_data,
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        refresh_token = create_refresh_token(token_data)

        # Set refresh token as httpOnly cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
            max_age=config.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        )

        # Cache user session
        session_data = {
            "access_token": access_token,
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "email_verified": user.email_verified,
                "firebase_uid": user.firebase_uid
            }
        }
        await auth_cache.cache_user_session(login_data.email, session_data)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "email_verified": user.email_verified,
                "firebase_uid": user.firebase_uid
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/firebase-login")
async def firebase_login(firebase_token: str):
    """Firebase token-based authentication"""
    try:
        # Verify Firebase token
        decoded_token = firebase_auth.verify_token(firebase_token)

        # Get or create user in our database
        db = SessionLocal()
        user = db.query(User).filter(User.firebase_uid == decoded_token["uid"]).first()

        if not user:
            # Create user if doesn't exist
            user = User(
                email=decoded_token["email"],
                first_name=decoded_token.get("name", "").split()[0] if decoded_token.get("name") else decoded_token["email"].split("@")[0],
                last_name=decoded_token.get("name", "").split()[-1] if decoded_token.get("name") and len(decoded_token.get("name", "").split()) > 1 else "User",
                is_active=True,
                email_verified=decoded_token.get("email_verified", False),
                firebase_uid=decoded_token["uid"]
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create our own tokens
        token_data = {
            "sub": user.email,
            "user_id": str(user.id),
            "firebase_uid": user.firebase_uid,
            "role": "user"
        }

        access_token = create_access_token(
            token_data,
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user={
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "email_verified": user.email_verified,
                "firebase_uid": user.firebase_uid
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Firebase login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase login failed"
        )


@router.post("/register")
@rate_limit_auth(max_requests=3, period=3600, identifier_func=lambda *args, **kwargs: args[0].email if args and hasattr(args[0], 'email') else "unknown")
async def register(user_data: RegisterRequest):
    """Register new user"""
    try:
        # Create user in Firebase
        firebase_user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=f"{user_data.first_name} {user_data.last_name}"
        )

        # Create user in our database
        db = SessionLocal()
        user = User(
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            is_active=True,
            email_verified=False,
            hashed_password=pwd_context.hash(user_data.password),
            firebase_uid=firebase_user["uid"]
        )
        db.add(user)
        db.commit()

        return {
            "message": "User registered successfully",
            "user_id": str(user.id),
            "email": user.email
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/refresh")
async def refresh_token(refresh_token: str = Cookie(None)):
    """Refresh access token"""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided"
        )

    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Create new access token
    token_data = {
        "sub": payload["sub"],
        "user_id": payload["user_id"],
        "firebase_uid": payload.get("firebase_uid"),
        "role": payload.get("role", "user")
    }

    access_token = create_access_token(
        token_data,
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/logout")
async def logout(response: Response, current_user: dict = Depends(get_current_user)):
    """Logout user"""
    # Clear refresh token cookie
    response.delete_cookie(key="refresh_token", httponly=True, secure=True, samesite="strict")
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    db = SessionLocal()
    user = db.query(User).filter(User.id == current_user["user_id"]).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "firebase_uid": user.firebase_uid,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.post("/verify-email")
async def verify_email(token: str):
    """Verify email with token"""
    try:
        firebase_auth.verify_email(token)

        # Update our database
        db = SessionLocal()
        # Extract UID from token and update user
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        user = db.query(User).filter(User.firebase_uid == decoded_token["uid"]).first()

        if user:
            user.email_verified = True
            db.commit()

        return {"message": "Email verified successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email verification failed"
        )


@router.post("/forgot-password")
async def forgot_password(email: str):
    """Send password reset email"""
    try:
        firebase_auth.reset_password(email)
        return {"message": "Password reset email sent"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to send password reset email"
        )
