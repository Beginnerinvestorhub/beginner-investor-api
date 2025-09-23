import os
from typing import List, Dict, Any, Optional, Union
from datetime import datetime, timedelta
import aiohttp
import asyncio
import json

from .base_service import BaseMarketDataService
from ..models.market_data import StockQuote, TimeSeriesData, DataSource, StockCandle

class FinnhubService(BaseMarketDataService):
    """Finnhub market data service implementation."""
    
    BASE_URL = "https://finnhub.io/api/v1"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize the Finnhub service.
        
        Args:
            api_key: Finnhub API key (defaults to FINNHUB_API_KEY env var)
            **kwargs: Additional arguments to pass to BaseMarketDataService
        """
        api_key = api_key or os.getenv('FINNHUB_API_KEY')
        if not api_key:
            raise ValueError("Finnhub API key is required")
            
        super().__init__(api_key=api_key, rate_limit_requests=60, rate_limit_period=60, **kwargs)
        self._session = None
        
    async def _make_request(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        """Make a request to the Finnhub API."""
        if params is None:
            params = {}
            
        params['token'] = self.api_key
        url = f"{self.BASE_URL}/{endpoint}"
        
        try:
            await self._enforce_rate_limit()
            session = await self.get_session()
            
            async with session.get(url, params=params) as response:
                response.raise_for_status()
                
                # Handle different response types
                content_type = response.headers.get('content-type', '')
                if 'application/json' in content_type:
                    return await response.json()
                else:
                    return await response.text()
                    
        except aiohttp.ClientError as e:
            print(f"Error making request to {url}: {e}")
            raise
    
    async def get_quote(self, symbol: str) -> Optional[StockQuote]:
        """Get the latest quote for a symbol."""
        try:
            data = await self._make_request('quote', {'symbol': symbol})
            
            if not data or 'c' not in data:
                return None
                
            return StockQuote(
                symbol=symbol,
                price=data['c'],
                change=data.get('d', 0),
                change_percent=data.get('dp', 0),
                volume=data.get('v', 0),
                timestamp=datetime.utcfromtimestamp(data.get('t', 0)) if data.get('t') else datetime.utcnow(),
                source=DataSource.FINNHUB
            )
            
        except Exception as e:
            print(f"Error getting Finnhub quote for {symbol}: {e}")
            return None
    
    async def get_historical_data(
        self, 
        symbol: str, 
        interval: str = '1d', 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> List[TimeSeriesData]:
        """Get historical price data for a symbol."""
        try:
            # Convert interval to Finnhub format
            resolution = self._map_interval(interval)
            
            # Set default date range if not provided
            if not end_date:
                end_date = datetime.utcnow()
            if not start_date:
                start_date = end_date - timedelta(days=30)
                
            # Convert dates to timestamps
            _from = int(start_date.timestamp())
            to = int(end_date.timestamp())
            
            # Make the request
            data = await self._make_request(
                'stock/candle',
                {
                    'symbol': symbol,
                    'resolution': resolution,
                    'from': _from,
                    'to': to
                }
            )
            
            if data.get('s') != 'ok' or not data.get('t'):
                return []
                
            # Convert to TimeSeriesData
            result = []
            for i in range(len(data['t'])):
                result.append(TimeSeriesData(
                    timestamp=datetime.utcfromtimestamp(data['t'][i]),
                    open=data['o'][i],
                    high=data['h'][i],
                    low=data['l'][i],
                    close=data['c'][i],
                    volume=data.get('v', [0] * len(data['t']))[i],
                    symbol=symbol,
                    interval=interval
                ))
                
            return result
            
        except Exception as e:
            print(f"Error getting Finnhub historical data for {symbol}: {e}")
            return []
    
    async def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        """Search for symbols matching a query."""
        try:
            data = await self._make_request('search', {'q': query})
            
            if not data or 'result' not in data:
                return []
                
            return [
                {
                    'symbol': item['symbol'],
                    'name': item['description'],
                    'exchange': item.get('displaySymbol', '').split(':')[0] if ':' in item.get('displaySymbol', '') else '',
                    'type': item.get('type', '').lower(),
                    'currency': item.get('currency', 'USD')
                }
                for item in data['result']
            ]
            
        except Exception as e:
            print(f"Error searching Finnhub symbols for {query}: {e}")
            return []
    
    def _map_interval(self, interval: str) -> str:
        """Map standard interval to Finnhub's format."""
        # Remove any numbers and convert to Finnhub resolution
        unit = ''.join(filter(str.isalpha, interval)).lower()
        
        if unit == 'm':  # Minutes
            return interval  # Finnhub supports '1', '5', '15', '30', '60'
        elif unit == 'h':  # Hours
            return str(int(interval[:-1]) * 60)  # Convert hours to minutes
        elif unit == 'd':  # Days
            return 'D'
        elif unit == 'w':  # Weeks
            return 'W'
        elif unit == 'M':  # Months
            return 'M'
        else:
            return 'D'  # Default to daily
    
    async def get_company_profile(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get company profile information."""
        try:
            return await self._make_request('stock/profile', {'symbol': symbol})
        except Exception as e:
            print(f"Error getting company profile for {symbol}: {e}")
            return None
    
    async def get_company_news(
        self, 
        symbol: str, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get news for a company."""
        try:
            if not end_date:
                end_date = datetime.utcnow()
            if not start_date:
                start_date = end_date - timedelta(days=30)
                
            return await self._make_request('company-news', {
                'symbol': symbol,
                'from': start_date.strftime('%Y-%m-%d'),
                'to': end_date.strftime('%Y-%m-%d')
            })
            
        except Exception as e:
            print(f"Error getting news for {symbol}: {e}")
            return []
