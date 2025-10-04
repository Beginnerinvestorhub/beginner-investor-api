from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class NudgeType(str, Enum):
    """Types of behavioral nudges"""
    REBALANCE = "rebalance"
    RISK_ALERT = "risk_alert"
    OPPORTUNITY = "opportunity"
    EDUCATIONAL = "educational"
    DIVERSIFICATION = "diversification"
    CONTRIBUTION = "contribution"

class NudgePriority(str, Enum):
    """Nudge priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class UserBehavior(str, Enum):
    """User behavioral patterns"""
    RISK_AVERSE = "risk_averse"
    RISK_SEEKING = "risk_seeking"
    LOSS_AVERSE = "loss_averse"
    MOMENTUM_CHASER = "momentum_chaser"
    PANIC_SELLER = "panic_seller"
    OVERCONFIDENT = "overconfident"
    DISCIPLINED = "disciplined"

class Nudge(BaseModel):
    """Behavioral nudge"""
    id: str
    user_id: str
    type: NudgeType
    priority: NudgePriority
    title: str = Field(..., max_length=200)
    message: str = Field(..., max_length=1000)
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    context: Optional[Dict] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_read: bool = False
    is_acted_on: bool = False

class BehavioralProfile(BaseModel):
    """User's behavioral profile"""
    user_id: str
    primary_behavior: UserBehavior
    secondary_behaviors: List[UserBehavior] = []
    risk_tolerance: float = Field(..., ge=0, le=1)
    loss_aversion_score: float = Field(..., ge=0, le=1)
    confidence_score: float = Field(..., ge=0, le=1)
    trading_frequency: str  # "low", "medium", "high"
    last_updated: datetime

class AIRecommendation(BaseModel):
    """AI-generated recommendation"""
    id: str
    user_id: str
    portfolio_id: str
    recommendation_type: str
    title: str
    description: str
    confidence_score: float = Field(..., ge=0, le=1)
    expected_impact: Optional[Dict] = None
    rationale: str
    created_at: datetime
    expires_at: Optional[datetime] = None