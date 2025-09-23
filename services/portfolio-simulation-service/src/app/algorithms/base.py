from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional
import numpy as np
import pandas as pd
from dataclasses import dataclass

@dataclass
class PortfolioWeights:
    """Data class to store portfolio weights and metadata."""
    weights: Dict[str, float]  # Ticker -> weight
    expected_return: float
    volatility: float
    sharpe_ratio: float
    risk_free_rate: float = 0.0
    
    def to_dict(self) -> Dict:
        """Convert portfolio weights to a dictionary."""
        return {
            "weights": self.weights,
            "metrics": {
                "expected_return": self.expected_return,
                "volatility": self.volatility,
                "sharpe_ratio": self.sharpe_ratio,
                "risk_free_rate": self.risk_free_rate
            }
        }

class PortfolioOptimizer(ABC):
    """Abstract base class for portfolio optimization algorithms."""
    
    def __init__(self, returns: pd.DataFrame, risk_free_rate: float = 0.0):
        """
        Initialize the portfolio optimizer.
        
        Args:
            returns: DataFrame with asset returns (rows=time, columns=assets)
            risk_free_rate: Annual risk-free rate (default: 0.0)
        """
        self.returns = returns
        self.risk_free_rate = risk_free_rate
        self.assets = returns.columns.tolist()
        self.num_assets = len(self.assets)
        self.expected_returns = self._calculate_expected_returns()
        self.cov_matrix = self._calculate_covariance_matrix()
        
    def _calculate_expected_returns(self) -> np.ndarray:
        """Calculate expected returns for each asset."""
        return self.returns.mean().values
    
    def _calculate_covariance_matrix(self) -> np.ndarray:
        """Calculate the covariance matrix of asset returns."""
        return self.returns.cov().values
    
    def calculate_portfolio_metrics(
        self, 
        weights: np.ndarray
    ) -> Tuple[float, float, float]:
        """
        Calculate portfolio metrics for given weights.
        
        Args:
            weights: Portfolio weights (should sum to 1)
            
        Returns:
            Tuple of (expected_return, volatility, sharpe_ratio)
        """
        # Ensure weights sum to 1 (within floating point tolerance)
        weights = weights / np.sum(weights)
        
        # Calculate portfolio metrics
        port_return = np.sum(self.expected_returns * weights)
        port_volatility = np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix, weights)))
        
        # Annualize the metrics (assuming daily returns)
        port_return_annual = (1 + port_return) ** 252 - 1
        port_volatility_annual = port_volatility * np.sqrt(252)
        
        # Calculate Sharpe ratio (with a small epsilon to avoid division by zero)
        sharpe_ratio = (port_return_annual - self.risk_free_rate) / (port_volatility_annual + 1e-8)
        
        return port_return_annual, port_volatility_annual, sharpe_ratio
    
    def get_weights_dict(self, weights: np.ndarray) -> Dict[str, float]:
        """Convert numpy array of weights to a dictionary with asset names."""
        return {asset: weight for asset, weight in zip(self.assets, weights)}
    
    @abstractmethod
    def optimize(self) -> PortfolioWeights:
        """Optimize portfolio weights. Must be implemented by subclasses."""
        pass
