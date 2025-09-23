from typing import Dict, Type, Optional, List, Any
from enum import Enum, auto
import os

from .base_service import BaseMarketDataService
from .yahoo_service import YahooFinanceService
from .alpha_vantage_service import AlphaVantageService
from .finnhub_service import FinnhubService
from ..models.market_data import StockQuote, TimeSeriesData, DataSource

class MarketDataProvider(Enum):
    """Enumeration of supported market data providers."""
    YAHOO = auto()
    ALPHA_VANTAGE = auto()
    FINNHUB = auto()

class MarketDataFactory:
    """Factory class for creating market data service instances."""
    
    _provider_map = {
        MarketDataProvider.YAHOO: YahooFinanceService,
        MarketDataProvider.ALPHA_VANTAGE: AlphaVantageService,
        MarketDataProvider.FINNHUB: FinnhubService,
    }
    
    _default_provider = MarketDataProvider.YAHOO
    
    @classmethod
    def get_available_providers(cls) -> List[MarketDataProvider]:
        """Get a list of all available market data providers."""
        return list(cls._provider_map.keys())
    
    @classmethod
    def create_service(
        cls, 
        provider: Optional[MarketDataProvider] = None,
        **kwargs
    ) -> BaseMarketDataService:
        """
        Create a market data service instance for the specified provider.
        
        Args:
            provider: The market data provider to use. If None, uses the default provider.
            **kwargs: Additional arguments to pass to the service constructor.
            
        Returns:
            An instance of the requested market data service.
            
        Raises:
            ValueError: If the specified provider is not supported.
        """
        if provider is None:
            provider = cls._default_provider
            
        if provider not in cls._provider_map:
            raise ValueError(f"Unsupported market data provider: {provider}")
            
        service_class = cls._provider_map[provider]
        
        # Load API key from environment if not provided
        api_key = kwargs.pop('api_key', None)
        if api_key is None:
            api_key = cls._get_api_key(provider)
            
        return service_class(api_key=api_key, **kwargs)
    
    @classmethod
    def _get_api_key(cls, provider: MarketDataProvider) -> Optional[str]:
        """Get the API key for the specified provider from environment variables."""
        env_vars = {
            MarketDataProvider.YAHOO: 'YAHOO_API_KEY',  # Note: Yahoo Finance typically doesn't require an API key
            MarketDataProvider.ALPHA_VANTAGE: 'ALPHA_VANTAGE_API_KEY',
            MarketDataProvider.FINNHUB: 'FINNHUB_API_KEY',
        }
        
        env_var = env_vars.get(provider)
        if env_var:
            return os.getenv(env_var)
        return None
    
    @classmethod
    def set_default_provider(cls, provider: MarketDataProvider):
        """
        Set the default market data provider.
        
        Args:
            provider: The provider to set as default.
            
        Raises:
            ValueError: If the specified provider is not supported.
        """
        if provider not in cls._provider_map:
            raise ValueError(f"Unsupported market data provider: {provider}")
        cls._default_provider = provider
        
    @classmethod
    def get_default_provider(cls) -> MarketDataProvider:
        """Get the current default market data provider."""
        return cls._default_provider
