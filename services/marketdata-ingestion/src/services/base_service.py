from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
import aiohttp
import logging

from ..models.market_data import MarketData, StockQuote, StockCandle, TimeSeriesData, DataSource

logger = logging.getLogger(__name__)

class BaseMarketDataService(ABC):
    """Base class for all market data services."""
    
    def __init__(self, api_key: Optional[str] = None, rate_limit_requests: int = 5, rate_limit_period: int = 60):
        """
        Initialize the market data service.
        
        Args:
            api_key: API key for the service
            rate_limit_requests: Number of requests allowed in the rate limit period
            rate_limit_period: Rate limit period in seconds
        """
        self.api_key = api_key
        self.rate_limit_requests = rate_limit_requests
        self.rate_limit_period = rate_limit_period
        self._request_timestamps: List[datetime] = []
        self._session: Optional[aiohttp.ClientSession] = None
        self._session_lock = asyncio.Lock()
        
    async def get_session(self) -> aiohttp.ClientSession:
        """Get or create an aiohttp client session."""
        async with self._session_lock:
            if self._session is None or self._session.closed:
                self._session = aiohttp.ClientSession()
        return self._session
        
    async def close(self):
        """Close the client session."""
        if self._session and not self._session.closed:
            await self._session.close()
            
    async def _enforce_rate_limit(self):
        """Enforce rate limiting."""
        now = datetime.utcnow()
        
        # Remove timestamps older than the rate limit period
        self._request_timestamps = [
            ts for ts in self._request_timestamps 
            if now - ts < timedelta(seconds=self.rate_limit_period)
        ]
        
        # If we've hit the rate limit, sleep until the oldest request is outside the window
        if len(self._request_timestamps) >= self.rate_limit_requests:
            sleep_time = (self._request_timestamps[0] + timedelta(seconds=self.rate_limit_period) - now).total_seconds()
            if sleep_time > 0:
                logger.debug(f"Rate limit reached, sleeping for {sleep_time:.2f} seconds")
                await asyncio.sleep(sleep_time)
                
        # Record this request
        self._request_timestamps.append(datetime.utcnow())
    
    @abstractmethod
    async def get_quote(self, symbol: str) -> Optional[StockQuote]:
        """Get the latest quote for a symbol."""
        pass
        
    @abstractmethod
    async def get_historical_data(
        self, 
        symbol: str, 
        interval: str = '1d', 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> List[TimeSeriesData]:
        """Get historical price data for a symbol."""
        pass
        
    @abstractmethod
    async def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        """Search for symbols matching a query."""
        pass
        
    def __del__(self):
        """Ensure the session is closed when the object is destroyed."""
        if hasattr(self, '_session') and self._session and not self._session.closed:
            asyncio.create_task(self.close())
