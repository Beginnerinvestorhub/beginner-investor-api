import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp
import asyncio

from alpha_vantage.async_support.timeseries import TimeSeries
from alpha_vantage.async_support.cryptocurrencies import CryptoCurrencies
from alpha_vantage.async_support.foreignexchange import ForeignExchange

from .base_service import BaseMarketDataService
from ..models.market_data import StockQuote, TimeSeriesData, DataSource

class AlphaVantageService(BaseMarketDataService):
    """Alpha Vantage market data service implementation."""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        """
        Initialize the Alpha Vantage service.
        
        Args:
            api_key: Alpha Vantage API key (defaults to ALPHA_VANTAGE_API_KEY env var)
            **kwargs: Additional arguments to pass to BaseMarketDataService
        """
        api_key = api_key or os.getenv('ALPHA_VANTAGE_API_KEY')
        if not api_key:
            raise ValueError("Alpha Vantage API key is required")
            
        super().__init__(api_key=api_key, **kwargs)
        self._ts = None
        self._cc = None
        self._fx = None
        
    async def _get_timeseries_client(self) -> TimeSeries:
        """Get or create the TimeSeries client."""
        if self._ts is None:
            session = await self.get_session()
            self._ts = TimeSeries(
                key=self.api_key,
                output_format='pandas',
                indexing_type='date',
                proxy=None,
                session=session
            )
        return self._ts
        
    async def _get_crypto_client(self) -> CryptoCurrencies:
        """Get or create the CryptoCurrencies client."""
        if self._cc is None:
            session = await self.get_session()
            self._cc = CryptoCurrencies(
                key=self.api_key,
                output_format='pandas',
                indexing_type='date',
                proxy=None,
                session=session
            )
        return self._cc
        
    async def _get_forex_client(self) -> ForeignExchange:
        """Get or create the ForeignExchange client."""
        if self._fx is None:
            session = await self.get_session()
            self._fx = ForeignExchange(
                key=self.api_key,
                output_format='pandas',
                proxy=None,
                session=session
            )
        return self._fx
    
    async def get_quote(self, symbol: str) -> Optional[StockQuote]:
        """Get the latest quote for a symbol."""
        try:
            await self._enforce_rate_limit()
            ts = await self._get_timeseries_client()
            
            # Get the latest data
            data, _ = await ts.get_quote_endpoint(symbol=symbol)
            
            if data.empty:
                return None
                
            # Convert to StockQuote
            return StockQuote(
                symbol=symbol,
                price=float(data['05. price']),
                change=float(data['09. change']),
                change_percent=float(data['10. change percent'].rstrip('%')),
                volume=int(data['06. volume']),
                timestamp=datetime.utcnow(),
                source=DataSource.ALPHA_VANTAGE
            )
            
        except Exception as e:
            print(f"Error getting Alpha Vantage quote for {symbol}: {e}")
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
            await self._enforce_rate_limit()
            ts = await self._get_timeseries_client()
            
            # Map interval to Alpha Vantage's format
            av_interval = self._map_interval(interval)
            
            # Get the data
            if av_interval == 'intraday':
                data, _ = await ts.get_intraday(
                    symbol=symbol, 
                    interval=interval,
                    outputsize='full'
                )
            else:
                data, _ = await ts.get_daily_adjusted(
                    symbol=symbol,
                    outputsize='full'
                )
            
            # Filter by date range if specified
            if start_date or end_date:
                if start_date:
                    data = data[data.index >= start_date.strftime('%Y-%m-%d')]
                if end_date:
                    data = data[data.index <= end_date.strftime('%Y-%m-%d')]
            
            # Convert to TimeSeriesData
            result = []
            for index, row in data.iterrows():
                result.append(TimeSeriesData(
                    timestamp=index.to_pydatetime(),
                    open=row['1. open'],
                    high=row['2. high'],
                    low=row['3. low'],
                    close=row['4. close'],
                    volume=int(row['5. volume']),
                    symbol=symbol,
                    interval=interval
                ))
                
            return result
            
        except Exception as e:
            print(f"Error getting Alpha Vantage historical data for {symbol}: {e}")
            return []
    
    async def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        """Search for symbols matching a query."""
        try:
            await self._enforce_rate_limit()
            
            # Alpha Vantage doesn't have a direct symbol search in the free tier
            # So we'll return an empty list for now
            # In a real implementation, you might want to use a different API for this
            return []
            
        except Exception as e:
            print(f"Error searching Alpha Vantage symbols for {query}: {e}")
            return []
    
    def _map_interval(self, interval: str) -> str:
        """Map standard interval to Alpha Vantage's format."""
        if interval.endswith('m'):  # Minutes
            return 'intraday'
        elif interval.endswith('h'):  # Hours
            return 'intraday'
        else:  # Days or more
            return 'daily'
    
    async def close(self):
        """Clean up resources."""
        await super().close()
        
        # Close Alpha Vantage clients
        if self._ts:
            await self._ts.close()
        if self._cc:
            await self._cc.close()
        if self._fx:
            await self._fx.close()
            
        self._ts = None
        self._cc = None
        self._fx = None
