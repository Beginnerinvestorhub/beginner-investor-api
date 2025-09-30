"""Pydantic models for portfolio data structures."""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum

class AssetClass(str, Enum):
    """Supported asset classes for portfolio simulation."""
    STOCK = "stock"
    BOND = "bond"
    CASH = "cash"
    COMMODITY = "commodity"
    CRYPTO = "crypto"
    ETF = "etf"
    MUTUAL_FUND = "mutual_fund"

class Asset(BaseModel):
    """Model representing a single asset in a portfolio."""
    id: str = Field(..., description="Unique identifier for the asset")
    symbol: str = Field(..., description="Ticker symbol")
    name: str = Field(..., description="Display name of the asset")
    asset_class: AssetClass = Field(..., description="Type of asset")
    quantity: float = Field(..., ge=0, description="Number of units held")
    average_cost: float = Field(..., ge=0, description="Average cost per unit")
    current_price: Optional[float] = Field(None, ge=0, description="Current market price")
    
    @validator('symbol')
    def validate_symbol(cls, v):
        """Ensure symbol is uppercase and contains only letters and numbers."""
        if not v.isalnum():
            raise ValueError("Symbol must contain only alphanumeric characters")
        return v.upper()

class PortfolioCreate(BaseModel):
    """Schema for creating a new portfolio."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    initial_balance: float = Field(10000.0, ge=0, description="Initial cash balance")
    base_currency: str = Field("USD", min_length=3, max_length=3)
    assets: List[Dict[str, Any]] = Field(default_factory=list, description="List of assets")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Retirement Portfolio",
                "description": "Long-term growth portfolio",
                "initial_balance": 100000.0,
                "base_currency": "USD",
                "assets": [
                    {"symbol": "AAPL", "quantity": 10, "average_cost": 150.0},
                    {"symbol": "GOOGL", "quantity": 5, "average_cost": 2500.0},
                    {"symbol": "BND", "quantity": 20, "average_cost": 75.0, "asset_class": "etf"}
                ]
            }
        }

class PortfolioUpdate(BaseModel):
    """Schema for updating an existing portfolio."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    base_currency: Optional[str] = Field(None, min_length=3, max_length=3)

class PortfolioInDB(PortfolioCreate):
    """Full portfolio model with database fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    
    class Config:
        orm_mode = True

class PortfolioResponse(BaseModel):
    """Response model for portfolio data."""
    id: str
    name: str
    description: Optional[str]
    base_currency: str
    current_value: float
    initial_balance: float
    return_percentage: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class SimulationParameters(BaseModel):
    """Parameters for running a portfolio simulation."""
    time_horizon_days: int = Field(365, ge=1, le=3650, description="Simulation period in days")
    num_simulations: int = Field(1000, ge=100, le=10000, description="Number of Monte Carlo simulations to run")
    inflation_rate: float = Field(0.02, ge=0, le=0.20, description="Annual inflation rate")
    risk_free_rate: float = Field(0.03, ge=0, le=0.20, description="Annual risk-free rate")
    
    class Config:
        schema_extra = {
            "example": {
                "time_horizon_days": 365,
                "num_simulations": 1000,
                "inflation_rate": 0.02,
                "risk_free_rate": 0.03
            }
        }

class SimulationResult(BaseModel):
    """Results from a portfolio simulation."""
    simulation_id: str
    portfolio_id: str
    parameters: SimulationParameters
    metrics: Dict[str, Any]
    percentiles: Dict[str, List[float]]
    created_at: datetime
    
    class Config:
        orm_mode = True
