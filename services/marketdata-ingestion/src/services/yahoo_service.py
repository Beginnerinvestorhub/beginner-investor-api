import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import pandas as pd
import asyncio
from concurrent.futures import ThreadPoolExecutor

from .base_service import BaseMarketDataService
from ..models.market_data import StockQuote, TimeSeriesData, DataSource

class YahooFinanceService(BaseMarketDataService):
    """Yahoo Finance market data service implementation."""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._executor = ThreadPoolExecutor(max_workers=5)
        
    async def _run_in_executor(self, func, *args):
        """Run a synchronous function in a thread pool."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self._executor, func, *args)
    
    async def get_quote(self, symbol: str) -> Optional[StockQuote]:
        """Get the latest quote for a symbol."""
        try:
            await self._enforce_rate_limit()
            
            def _get_quote():
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period='1d')
                if hist.empty:
                    return None
                    
                last_row = hist.iloc[-1]
                prev_close = ticker.info.get('previousClose', last_row['Close'])
                change = last_row['Close'] - prev_close
                change_percent = (change / prev_close) * 100 if prev_close else 0
                
                return StockQuote(
                    symbol=symbol,
                    price=last_row['Close'],
                    change=change,
                    change_percent=change_percent,
                    volume=int(last_row['Volume']),
                    timestamp=datetime.utcnow(),
                    source=DataSource.YAHOO
                )
                
            return await self._run_in_executor(_get_quote)
            
        except Exception as e:
            print(f"Error getting quote for {symbol}: {e}")
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
            
            # Convert to pandas period strings
            if not start_date:
                start_date = datetime.now() - timedelta(days=30)
            if not end_date:
                end_date = datetime.now()
                
            period = self._get_yahoo_period(start_date, end_date, interval)
            
            def _get_historical():
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period=period, interval=interval)
                if hist.empty:
                    return []
                    
                return [
                    TimeSeriesData(
                        timestamp=index.to_pydatetime(),
                        open=row['Open'],
                        high=row['High'],
                        low=row['Low'],
                        close=row['Close'],
                        volume=int(row['Volume']),
                        symbol=symbol,
                        interval=interval
                    )
                    for index, row in hist.iterrows()
                ]
                
            return await self._run_in_executor(_get_historical)
            
        except Exception as e:
            print(f"Error getting historical data for {symbol}: {e}")
            return []
    
    async def search_symbols(self, query: str) -> List[Dict[str, Any]]:
        """Search for symbols matching a query."""
        try:
            await self._enforce_rate_limit()
            
            def _search():
                tickers = yf.Tickers(query)
                return [
                    {
                        'symbol': symbol,
                        'name': ticker.info.get('shortName', ''),
                        'exchange': ticker.info.get('exchange', ''),
                        'type': ticker.info.get('quoteType', '').lower(),
                        'currency': ticker.info.get('currency', 'USD')
                    }
                    for symbol, ticker in tickers.tickers.items()
                    if hasattr(ticker, 'info')
                ]
                
            return await self._run_in_executor(_search)
            
        except Exception as e:
            print(f"Error searching symbols for {query}: {e}")
            return []
    
    def _get_yahoo_period(self, start_date: datetime, end_date: datetime, interval: str) -> str:
        """Convert date range to Yahoo Finance period string."""
        delta = end_date - start_date
        days = delta.days
        
        if interval.endswith('m'):  # Minutes
            if days <= 7:
                return '7d'
            elif days <= 30:
                return '1mo'
            else:
                return '3mo'
        elif interval.endswith('h'):  # Hours
            if days <= 60:
                return '60d'
            else:
                return '1y'
        else:  # Days or more
            if days <= 5:
                return '5d'
            elif days <= 30:
                return '1mo'
            elif days <= 90:
                return '3mo'
            elif days <= 365:
                return '1y'
            elif days <= 365 * 2:
                return '2y'
            elif days <= 365 * 5:
                return '5y'
            else:
                return 'max'
    
    async def close(self):
        """Clean up resources."""
        await super().close()
        self._executor.shutdown(wait=True)
        
    def __del__(self):
        """Ensure resources are cleaned up."""
        if hasattr(self, '_executor'):
            self._executor.shutdown(wait=False)
        super().__del__()
