from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum

class RiskLevel(str, Enum):
    """Enumeration for risk levels."""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

class TimePeriod(str, Enum):
    """Enumeration for time periods."""
    DAILY = "1d"
    WEEKLY = "1w"
    MONTHLY = "1m"
    QUARTERLY = "3m"
    YEARLY = "1y"
    FIVE_YEARS = "5y"
    TEN_YEARS = "10y"

class RiskMetrics(BaseModel):
    """Model for storing and validating risk metrics."""
    # Basic information
    symbol: str = Field(..., description="Asset symbol or identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of the calculation")
    period: TimePeriod = Field(TimePeriod.DAILY, description="Time period for the metrics")
    
    # Return metrics
    returns: List[float] = Field(..., description="List of periodic returns")
    cumulative_return: float = Field(..., description="Cumulative return over the period")
    annualized_return: Optional[float] = Field(None, description="Annualized return")
    
    # Risk metrics
    volatility: float = Field(..., description="Standard deviation of returns (annualized)")
    sharpe_ratio: Optional[float] = Field(None, description="Risk-adjusted return metric")
    sortino_ratio: Optional[float] = Field(None, description="Downside risk-adjusted return metric")
    max_drawdown: float = Field(..., description="Maximum drawdown over the period")
    
    # Value at Risk (VaR) metrics
    var_95: float = Field(..., description="Value at Risk at 95% confidence level")
    var_99: float = Field(..., description="Value at Risk at 99% confidence level")
    expected_shortfall_95: float = Field(..., description="Expected Shortfall at 95% confidence level")
    
    # Market metrics
    beta: Optional[float] = Field(None, description="Beta relative to market index")
    alpha: Optional[float] = Field(None, description="Risk-adjusted return relative to market")
    
    # Risk assessment
    risk_level: RiskLevel = Field(..., description="Overall risk assessment")
    risk_score: float = Field(..., ge=0, le=100, description="Numeric risk score (0-100)")
    
    # Additional metadata
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    @validator('returns')
    def validate_returns(cls, v):
        """Validate that returns list is not empty."""
        if not v:
            raise ValueError("Returns list cannot be empty")
        return v
    
    @validator('cumulative_return')
    def validate_cumulative_return(cls, v):
        """Validate cumulative return is within reasonable bounds."""
        if v < -1.0:
            raise ValueError("Cumulative return cannot be less than -100%")
        return v
    
    @validator('volatility')
    def validate_volatility(cls, v):
        """Validate volatility is non-negative."""
        if v < 0:
            raise ValueError("Volatility cannot be negative")
        return v
    
    @validator('risk_score')
    def validate_risk_score(cls, v):
        """Validate risk score is between 0 and 100."""
        if not 0 <= v <= 100:
            raise ValueError("Risk score must be between 0 and 100")
        return v
    
    class Config:
        """Pydantic config."""
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
        schema_extra = {
            "example": {
                "symbol": "AAPL",
                "timestamp": "2023-10-15T12:00:00Z",
                "period": "1y",
                "returns": [0.01, -0.02, 0.015, -0.01, 0.02],
                "cumulative_return": 0.015,
                "annualized_return": 0.18,
                "volatility": 0.25,
                "sharpe_ratio": 0.8,
                "sortino_ratio": 1.2,
                "max_drawdown": -0.15,
                "var_95": -0.05,
                "var_99": -0.08,
                "expected_shortfall_95": -0.06,
                "beta": 1.2,
                "alpha": 0.02,
                "risk_level": "moderate",
                "risk_score": 65.5,
                "metadata": {
                    "data_points": 252,
                    "last_updated": "2023-10-15T12:00:00Z"
                }
            }
        }
