from datetime import datetime
from sqlalchemy import Column, String, Enum as SQLEnum, JSON, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from enum import Enum
from typing import Dict, Any, Optional, List
from pydantic import BaseModel as PydanticBaseModel, Field, validator
from uuid import uuid4

# Create a simple base for this service
Base = declarative_base()

class NudgeType(str, Enum):
    """Types of nudges that can be sent to users."""
    EDUCATIONAL = "educational"
    ACTION = "action"
    REMINDER = "reminder"
    AFFILIATE = "affiliate"

class NudgeStatus(str, Enum):
    """Status of a nudge in the system."""
    PENDING = "pending"
    SENT = "sent"
    VIEWED = "viewed"
    CLICKED = "clicked"
    DISMISSED = "dismissed"
    CONVERTED = "converted"

class NudgeBase(BaseModel):
    """Base model for nudge data."""
    user_id: str = Field(..., description="ID of the user receiving the nudge")
    type: NudgeType = Field(..., description="Type of nudge")
    title: str = Field(..., max_length=100, description="Short title for the nudge")
    content: str = Field(..., description="Main content of the nudge")
    priority: int = Field(default=0, ge=0, le=10, description="Priority level (0-10)")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class NudgeCreate(NudgeBase):
    """Model for creating a new nudge."""
    status: NudgeStatus = Field(default=NudgeStatus.PENDING, description="Initial status of the nudge")
    scheduled_for: Optional[datetime] = Field(
        default=None, 
        description="When the nudge should be sent (null for immediate)"
    )
    expires_at: Optional[datetime] = Field(
        default=None,
        description="When the nudge expires and should no longer be shown"
    )

class NudgeInDB(NudgeCreate):
    """Model for nudges stored in the database."""
    id: str = Field(default_factory=lambda: str(uuid4()), description="Unique identifier")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When the nudge was created")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="When the nudge was last updated")
    sent_at: Optional[datetime] = Field(None, description="When the nudge was sent to the user")
    viewed_at: Optional[datetime] = Field(None, description="When the user first viewed the nudge")
    clicked_at: Optional[datetime] = Field(None, description="When the user clicked on the nudge")
    dismissed_at: Optional[datetime] = Field(None, description="When the user dismissed the nudge")
    converted_at: Optional[datetime] = Field(None, description="When the nudge resulted in a conversion")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123",
                "type": "educational",
                "title": "Learn About Index Funds",
                "content": "Index funds can help you diversify your portfolio with minimal effort.",
                "priority": 5,
                "status": "sent",
                "metadata": {"category": "investing_basics"},
                "created_at": "2023-01-01T12:00:00Z",
                "updated_at": "2023-01-01T12:00:00Z",
                "sent_at": "2023-01-01T12:05:00Z",
                "viewed_at": "2023-01-01T14:30:00Z"
            }
        }

class NudgeUpdate(BaseModel):
    """Model for updating an existing nudge."""
    status: Optional[NudgeStatus] = None
    metadata: Optional[Dict[str, Any]] = None
    viewed: Optional[bool] = Field(None, description="Set to true if the nudge was viewed")
    clicked: Optional[bool] = Field(None, description="Set to true if the nudge was clicked")
    dismissed: Optional[bool] = Field(None, description="Set to true if the nudge was dismissed")
    converted: Optional[bool] = Field(None, description="Set to true if the nudge resulted in a conversion")

    @validator('metadata')
    def validate_metadata(cls, v):
        if v is not None and not isinstance(v, dict):
            raise ValueError("Metadata must be a dictionary")
        return v or {}

class NudgeResponse(NudgeInDB):
    """Model for API responses with nudge data."""
    pass

class NudgeListResponse(BaseModel):
    """Model for API responses with a list of nudges."""
    items: List[NudgeResponse]
    total: int
    page: int
    size: int
    has_more: bool

    class Config:
        schema_extra = {
            "example": {
                "items": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "user_id": "user_123",
                        "type": "educational",
                        "title": "Learn About Index Funds",
                        "content": "Index funds can help you diversify your portfolio with minimal effort.",
                        "status": "viewed",
                        "created_at": "2023-01-01T12:00:00Z"
                    }
                ],
                "total": 1,
                "page": 1,
                "size": 10,
                "has_more": False
            }
        }

# SQLAlchemy model for database
class Nudge(Base):
    """SQLAlchemy model for nudges stored in the database."""
    __tablename__ = "nudges"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid4()))
    user_id = Column(String, index=True, nullable=False)
    type = Column(SQLEnum(NudgeType), nullable=False)
    title = Column(String(100), nullable=False)
    content = Column(String, nullable=False)
    priority = Column(Integer, default=0, nullable=False)
    status = Column(SQLEnum(NudgeStatus), default=NudgeStatus.PENDING, nullable=False)
    metadata = Column(JSON, default=dict)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    viewed_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    dismissed_at = Column(DateTime, nullable=True)
    converted_at = Column(DateTime, nullable=True)

    scheduled_for = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
