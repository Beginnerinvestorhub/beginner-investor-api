from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class RiskMetric(str, Enum):
    """Risk metrics"""
    VAR = "var"  # Value at Risk
    CVAR = "cvar"  # Conditional VaR
    VOLATILITY = "volatility"
    BETA = "beta"
    SHARPE = "sharpe_ratio"
    SORTINO = "sortino_ratio"
    MAX_DRAWDOWN = "max_drawdown"

class ConfidenceLevel(float, Enum):
    """Confidence levels for risk calculations"""
    NINETY = 0.90
    NINETY_FIVE = 0.95
    NINETY_NINE = 0.99

class RiskAnalysisRequest(BaseModel):
    """Request for risk analysis"""
    portfolio_id: str
    time_horizon: int = Field(default=252, ge=1, le=1260)  # Trading days
    confidence_level: ConfidenceLevel = ConfidenceLevel.NINETY_FIVE
    metrics: List[RiskMetric] = Field(default_factory=lambda: list(RiskMetric))
    include_stress_test: bool = False

class RiskScore(BaseModel):
    """Risk score details"""
    score: float = Field(..., ge=0, le=10)
    level: str  # "Low", "Moderate", "High", "Very High"
    factors: Dict[str, float]
    recommendations: List[str]

class RiskAnalysisResult(BaseModel):
    """Risk analysis result"""
    portfolio_id: str
    analysis_date: datetime
    
    # Core metrics
    var: Optional[Decimal] = None
    cvar: Optional[Decimal] = None
    volatility: Optional[float] = None
    beta: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    sortino_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    
    # Risk score
    risk_score: RiskScore
    
    # Concentration risk
    concentration_risk: Optional[Dict[str, float]] = None
    
    # Stress test results
    stress_test_results: Optional[Dict[str, Decimal]] = None
    
    # Time horizon used
    time_horizon_days: int
    confidence_level: float
    
    class Config:
        use_enum_values = True

class StressScenario(BaseModel):
    """Stress test scenario"""
    name: str
    description: str
    market_shock: float  # e.g., -0.20 for 20% drop
    duration_days: int
    affected_assets: Optional[List[str]] = None

class StressTestResult(BaseModel):
    """Stress test result"""
    scenario: StressScenario
    portfolio_impact: Decimal
    portfolio_impact_pct: float
    worst_position: Optional[str] = None
    best_position: Optional[str] = None
    recovery_time_estimate: Optional[int] = None  # days