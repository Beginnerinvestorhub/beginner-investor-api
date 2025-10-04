from datetime import datetime, date, timedelta, timezone
from typing import Optional, Union
import calendar

def utc_now() -> datetime:
    """Get current UTC time"""
    return datetime.now(timezone.utc)

def to_utc(dt: datetime) -> datetime:
    """Convert datetime to UTC"""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def from_timestamp(timestamp: Union[int, float]) -> datetime:
    """Convert Unix timestamp to datetime"""
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)

def to_timestamp(dt: datetime) -> float:
    """Convert datetime to Unix timestamp"""
    return dt.timestamp()

def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime to string"""
    return dt.strftime(format_str)

def parse_datetime(date_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> datetime:
    """Parse string to datetime"""
    return datetime.strptime(date_str, format_str)

def add_business_days(start_date: date, days: int) -> date:
    """Add business days (excluding weekends)"""
    current = start_date
    while days > 0:
        current += timedelta(days=1)
        if current.weekday() < 5:  # Monday = 0, Friday = 4
            days -= 1
    return current

def get_trading_days(start: date, end: date) -> int:
    """Count trading days between two dates (excluding weekends)"""
    days = 0
    current = start
    while current <= end:
        if current.weekday() < 5:
            days += 1
        current += timedelta(days=1)
    return days

def is_market_open(dt: Optional[datetime] = None) -> bool:
    """
    Check if market is open (simple version)
    TODO: Add holiday calendar
    """
    if dt is None:
        dt = utc_now()
    
    # Convert to Eastern Time (US markets)
    eastern = dt.astimezone(timezone(timedelta(hours=-5)))
    
    # Weekend check
    if eastern.weekday() >= 5:
        return False
    
    # Market hours: 9:30 AM - 4:00 PM ET
    market_open = eastern.replace(hour=9, minute=30, second=0)
    market_close = eastern.replace(hour=16, minute=0, second=0)
    
    return market_open <= eastern <= market_close

def get_quarter_start(dt: datetime) -> datetime:
    """Get the start of the quarter for a given date"""
    quarter_month = ((dt.month - 1) // 3) * 3 + 1
    return dt.replace(month=quarter_month, day=1, hour=0, minute=0, second=0)

def get_month_start(dt: datetime) -> datetime:
    """Get the start of the month"""
    return dt.replace(day=1, hour=0, minute=0, second=0)

def get_year_start(dt: datetime) -> datetime:
    """Get the start of the year"""
    return dt.replace(month=1, day=1, hour=0, minute=0, second=0)
