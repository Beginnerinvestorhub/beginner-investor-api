from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
from enum import Enum

class WSEventType(str, Enum):
    """WebSocket event types"""
    CONNECT = "connect"
    DISCONNECT = "disconnect"
    SUBSCRIBE = "subscribe"
    UNSUBSCRIBE = "unsubscribe"
    QUOTE_UPDATE = "quote_update"
    PORTFOLIO_UPDATE = "portfolio_update"
    ALERT = "alert"
    NUDGE = "nudge"
    ERROR = "error"

class WSMessage(BaseModel):
    """WebSocket message"""
    event: WSEventType
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

class WSSubscription(BaseModel):
    """WebSocket subscription"""
    channel: str
    symbols: Optional[List[str]] = None
    user_id: Optional[str] = None
    portfolio_id: Optional[str] = None