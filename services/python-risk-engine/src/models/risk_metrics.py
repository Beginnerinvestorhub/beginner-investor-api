from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class RiskMetrics(BaseModel):
    """Risk metrics model for portfolio analysis"""
    portfolio_id: str
    timestamp: datetime
    volatility: float
    var_95: float  # Value at Risk (95% confidence)
    var_99: float  # Value at Risk (99% confidence)
    sharpe_ratio: float
    sortino_ratio: Optional[float]
    max_drawdown: float
    beta: Optional[float]
    correlation_matrix: Optional[Dict[str, Dict[str, float]]]
    
class RiskProfile(BaseModel):
    """User risk profile model"""
    user_id: str
    risk_tolerance: int  # 1-10 scale
    investment_horizon: int  # in months
    loss_tolerance: float  # maximum drawdown tolerance
    preferred_asset_classes: List[str]
    risk_metrics: Optional[RiskMetrics]
    
class RiskAlert(BaseModel):
    """Risk alert model for notifications"""
    portfolio_id: str
    alert_type: str
    severity: int  # 1-5 scale
    message: str
    timestamp: datetime
    metrics: RiskMetrics
    requires_action: bool
    suggested_actions: List[str]