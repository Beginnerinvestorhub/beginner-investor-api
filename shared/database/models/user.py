 
# Import missing timedelta and Integer, and clean up unnecessary imports
from datetime import datetime, timedelta
from typing import Optional, List
from uuid import UUID

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Index,
    Integer, # <-- Added missing Integer import
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.orm import relationship

from .base import Base

class User(Base):
    """
    User model for authentication and user management.
    """
    __tablename__ = "users"

    # Authentication fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    email_verified = Column(Boolean(), default=False)

    # User information
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    phone_number = Column(String(20), nullable=True)

    # Profile information
    profile_picture = Column(String(255), nullable=True)
    timezone = Column(String(50), default="UTC")
    locale = Column(String(10), default="en-US")

    # OAuth and social login
    oauth_provider = Column(String(20), nullable=True)
    oauth_id = Column(String(255), nullable=True, index=True)
    oauth_data = Column(JSONB, nullable=True)

    # Security
    last_login = Column(DateTime, nullable=True)
    last_password_change = Column(DateTime, nullable=True)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)

    # Verification
    verification_token = Column(String(255), nullable=True)
    verification_expires = Column(DateTime, nullable=True)

    # Account status
    locked_until = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)

    # Relationships (Corrected and Consolidated)
    
    # FIX 1: Change back_populates to "owner" to match the Portfolio model's relationship name.
    portfolios = relationship("Portfolio", back_populates="owner", cascade="all, delete-orphan")
    
    # FIX 2: Change model string reference from "Subscription" to "UserSubscription" 
    # and update back_populates to "user" (assuming UserSubscription uses 'user').
    subscriptions = relationship("UserSubscription", back_populates="user", cascade="all, delete-orphan")
    
    # Relationships for UserRole and UserSession
    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    

    # Indexes
    __table_args__ = (
        Index("idx_user_email_lower", "email", postgresql_using="btree",
              postgresql_ops={"email": "text_pattern_ops"}),
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email}, is_active={self.is_active})>"

    def is_locked(self) -> bool:
        """Check if user account is locked due to too many failed attempts."""
        if self.locked_until:
            return datetime.utcnow() < self.locked_until
        return False

    def increment_failed_attempts(self) -> None:
        """Increment failed login attempts and lock account if necessary."""
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            # Lock for 30 minutes
            self.locked_until = datetime.utcnow() + timedelta(minutes=30)

    def reset_failed_attempts(self) -> None:
        """Reset failed login attempts on successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None

    @property
    def full_name(self) -> str:
        """Return the full name of the user."""
        return f"{self.first_name or ''} {self.last_name or ''}".strip() or self.email

    @property
    def is_authenticated(self) -> bool:
        """Check if the user is authenticated."""
        return self.is_active

    @property
    def is_admin(self) -> bool:
        """Check if the user has admin privileges."""
        return self.is_superuser

    def has_permission(self, permission: str) -> bool:
        """Check if the user has a specific permission."""
        if self.is_superuser:
            return True
        return False

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Convert user to dictionary, optionally including sensitive information."""
        data = {
            "id": str(self.id),
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_superuser": self.is_superuser,
            "email_verified": self.email_verified,
            "profile_picture": self.profile_picture,
            "timezone": self.timezone,
            "locale": self.locale,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_sensitive:
            data.update({
                "phone_number": self.phone_number,
                "oauth_provider": self.oauth_provider,
                "last_login": self.last_login.isoformat() if self.last_login else None,
            })

        return data


class UserRole(Base):
    """
    User role association model for many-to-many relationship between users and roles.
    """
    __tablename__ = "user_roles"
    
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    role = Column(String(50), primary_key=True)  # e.g., 'admin', 'user', 'premium'
    
    # Additional role metadata
    granted_at = Column(DateTime, default=datetime.utcnow)
    granted_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="roles")
    
    # Role-specific permissions (stored as JSON)
    permissions = Column(JSONB, default=list, nullable=False)
    
    def __repr__(self) -> str:
        return f"<UserRole user_id={self.user_id} role={self.role}>"


class UserSession(Base):
    """
    User session model for tracking active user sessions.
    """
    __tablename__ = "user_sessions"
    
    session_id = Column(String(255), primary_key=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    
    # Session data
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars
    location = Column(JSONB, nullable=True)  # GeoIP data
    
    # Session timestamps
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Session status
    is_revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    def is_valid(self) -> bool:
        """Check if the session is still valid."""
        now = datetime.utcnow()
        return not (self.is_revoked or now > self.expires_at)
    
    def to_dict(self) -> dict:
        """Convert session to dictionary."""
        return {
            "session_id": self.session_id,
            "user_id": str(self.user_id),
            "user_agent": self.user_agent,
            "ip_address": self.ip_address,
            "location": self.location,
            "issued_at": self.issued_at.isoformat(),
            "expires_at": self.expires_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "is_revoked": self.is_revoked,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
        }

