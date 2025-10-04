from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from decimal import Decimal

class AssetClass(str, Enum):
    """Asset classes"""
    STOCKS = "stocks"
    BONDS = "bonds"
    CRYPTO = "crypto"
    COMMODITIES = "commodities"
    REAL_ESTATE = "real_estate"
    CASH = "cash"

class RiskLevel(str, Enum):
    """Risk tolerance levels"""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

class PortfolioStatus(str, Enum):
    """Portfolio status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    SIMULATED = "simulated"

class Position(BaseModel):
    """Individual position in portfolio"""
    symbol: str = Field(..., min_length=1, max_length=10)
    quantity: Decimal = Field(..., gt=0)
    cost_basis: Decimal = Field(..., ge=0)
    current_price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    asset_class: AssetClass
    weight: Optional[float] = Field(None, ge=0, le=1)
    
    @validator('symbol')
    def symbol_uppercase(cls, v):
        return v.upper()

class PortfolioBase(BaseModel):
    """Base portfolio model"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    risk_level: RiskLevel = RiskLevel.MODERATE
    target_allocation: Optional[dict[AssetClass, float]] = None

class PortfolioCreate(PortfolioBase):
    """Portfolio creation model"""
    initial_value: Decimal = Field(..., gt=0)
    positions: List[Position] = []

class PortfolioUpdate(BaseModel):
    """Portfolio update model"""
    name: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
    target_allocation: Optional[dict[AssetClass, float]] = None
    status: Optional[PortfolioStatus] = None

class PortfolioInDB(PortfolioBase):
    """Portfolio in database"""
    id: str
    user_id: str
    status: PortfolioStatus = PortfolioStatus.ACTIVE
    total_value: Decimal
    cash_balance: Decimal = Decimal("0")
    positions: List[Position] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        use_enum_values = True

class PortfolioMetrics(BaseModel):
    """Portfolio performance metrics"""
    portfolio_id: str
    total_value: Decimal
    total_return: Decimal
    total_return_pct: float
    day_change: Decimal
    day_change_pct: float
    sharpe_ratio: Optional[float] = None
    volatility: Optional[float] = None
    beta: Optional[float] = None
    alpha: Optional[float] = None
    max_drawdown: Optional[float] = None
    calculated_at: datetime