from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class DataSource(str, Enum):
    YAHOO = "yahoo"
    ALPHA_VANTAGE = "alpha_vantage"
    FINNHUB = "finnhub"
    COINBASE = "coinbase"
    COINGECKO = "coingecko"

class TimeSeriesData(BaseModel):
    """Represents a single data point in a time series."""
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    symbol: str
    interval: str  # e.g., '1d', '1h', '5m'

class StockQuote(BaseModel):
    """Represents a stock quote at a specific point in time."""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    timestamp: datetime
    source: DataSource

class StockCandle(BaseModel):
    """Represents a candlestick data point."""
    symbol: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    interval: str

class MarketData(BaseModel):
    """Main model for market data, can contain various types of market data."""
    symbol: str
    data_type: str  # 'quote', 'candle', 'news', etc.
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: DataSource
    metadata: Dict[str, Any] = {}

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
