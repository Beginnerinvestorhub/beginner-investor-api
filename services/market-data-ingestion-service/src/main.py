import os
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl

from services.market_data_factory import MarketDataFactory, MarketDataProvider
from models.market_data import StockQuote, TimeSeriesData, StockCandle

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Market Data Ingestion Service",
    description="Service for ingesting and serving market data from various providers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class QuoteResponse(StockQuote):
    """Response model for quote endpoint."""
    pass

class HistoricalDataResponse(BaseModel):
    """Response model for historical data endpoint."""
    symbol: str
    interval: str
    data: List[TimeSeriesData]
    provider: str

class SearchResponse(BaseModel):
    """Response model for symbol search endpoint."""
    results: List[Dict[str, Any]]
    provider: str

# Health check endpoint
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "market-data-ingestion"
    }

# Get current quote
@app.get("/quote/{symbol}", response_model=QuoteResponse)
async def get_quote(
    symbol: str,
    provider: MarketDataProvider = MarketDataProvider.YAHOO
):
    """
    Get the latest quote for a symbol.
    
    Args:
        symbol: The stock/crypto symbol to get a quote for
        provider: The market data provider to use (default: yahoo)
        
    Returns:
        Current quote information for the symbol
    """
    try:
        service = MarketDataFactory.create_service(provider=provider)
        quote = await service.get_quote(symbol)
        
        if not quote:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No data found for symbol: {symbol}"
            )
            
        return quote
        
    except Exception as e:
        logger.error(f"Error getting quote for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get quote: {str(e)}"
        )

# Get historical data
@app.get("/historical/{symbol}", response_model=HistoricalDataResponse)
async def get_historical_data(
    symbol: str,
    interval: str = Query("1d", regex=r"^\d+[mhdwM]$"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    provider: MarketDataProvider = MarketDataProvider.YAHOO
):
    """
    Get historical price data for a symbol.
    
    Args:
        symbol: The stock/crypto symbol to get data for
        interval: The time interval between data points (e.g., 1m, 1h, 1d, 1w, 1M)
        start_date: Start date for the historical data
        end_date: End date for the historical data (default: now)
        provider: The market data provider to use (default: yahoo)
        
    Returns:
        Historical price data for the symbol
    """
    try:
        service = MarketDataFactory.create_service(provider=provider)
        data = await service.get_historical_data(
            symbol=symbol,
            interval=interval,
            start_date=start_date,
            end_date=end_date or datetime.utcnow()
        )
        
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No historical data found for symbol: {symbol}"
            )
            
        return {
            "symbol": symbol,
            "interval": interval,
            "data": data,
            "provider": provider.name.lower()
        }
        
    except Exception as e:
        logger.error(f"Error getting historical data for {symbol}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get historical data: {str(e)}"
        )

# Search symbols
@app.get("/search", response_model=SearchResponse)
async def search_symbols(
    query: str,
    provider: MarketDataProvider = MarketDataProvider.YAHOO
):
    """
    Search for symbols matching a query.
    
    Args:
        query: The search query (can be a company name, symbol, etc.)
        provider: The market data provider to use (default: yahoo)
        
    Returns:
        List of matching symbols and their details
    """
    try:
        service = MarketDataFactory.create_service(provider=provider)
        results = await service.search_symbols(query)
        
        return {
            "results": results,
            "provider": provider.name.lower()
        }
        
    except Exception as e:
        logger.error(f"Error searching symbols for '{query}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search symbols: {str(e)}"
        )

# Get available providers
@app.get("/providers")
async def get_available_providers():
    """Get a list of available market data providers."""
    providers = MarketDataFactory.get_available_providers()
    return {
        "providers": [provider.name.lower() for provider in providers],
        "default": MarketDataFactory.get_default_provider().name.lower()
    }

if __name__ == "__main__":
    # Run the FastAPI application
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8001)),
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info")
    )
