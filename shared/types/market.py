from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class MarketDataSource(str, Enum):
    """Market data sources"""
    YAHOO = "yahoo"
    ALPHA_VANTAGE = "alpha_vantage"
    POLYGON = "polygon"
    IEX = "iex"
    INTERNAL = "internal"

class TimeInterval(str, Enum):
    """Time intervals"""
    MINUTE_1 = "1m"
    MINUTE_5 = "5m"
    MINUTE_15 = "15m"
    MINUTE_30 = "30m"
    HOUR_1 = "1h"
    HOUR_4 = "4h"
    DAY_1 = "1d"
    WEEK_1 = "1w"
    MONTH_1 = "1M"

class OHLCV(BaseModel):
    """Open, High, Low, Close, Volume data"""
    timestamp: datetime
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int
    symbol: str

class Quote(BaseModel):
    """Real-time quote"""
    symbol: str
    price: Decimal
    bid: Optional[Decimal] = None
    ask: Optional[Decimal] = None
    bid_size: Optional[int] = None
    ask_size: Optional[int] = None
    volume: int
    timestamp: datetime
    source: MarketDataSource

class HistoricalDataRequest(BaseModel):
    """Request for historical market data"""
    symbols: List[str] = Field(..., min_items=1, max_items=50)
    start_date: date
    end_date: date
    interval: TimeInterval = TimeInterval.DAY_1
    adjusted: bool = True

class MarketSnapshot(BaseModel):
    """Market snapshot at a point in time"""
    timestamp: datetime
    quotes: Dict[str, Quote]
    indices: Optional[Dict[str, Decimal]] = None
    market_status: str  # "open", "closed", "pre_market", "after_hours"