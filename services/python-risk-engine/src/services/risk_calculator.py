import numpy as np
from typing import List, Dict, Optional
from datetime import datetime
from ..models.risk_metrics import RiskMetrics

class RiskCalculator:
    """Core risk calculation service"""
    
    def __init__(self, lookback_period: int = 252):
        self.lookback_period = lookback_period
        
    def calculate_portfolio_risk(
        self,
        portfolio_id: str,
        returns: np.ndarray,
        weights: np.ndarray,
        asset_correlations: Optional[np.ndarray] = None
    ) -> RiskMetrics:
        """Calculate comprehensive risk metrics for a portfolio"""
        
        # Calculate volatility
        portfolio_volatility = self._calculate_volatility(returns, weights)
        
        # Calculate Value at Risk
        var_95 = self._calculate_var(returns, weights, confidence_level=0.95)
        var_99 = self._calculate_var(returns, weights, confidence_level=0.99)
        
        # Calculate ratios
        sharpe = self._calculate_sharpe_ratio(returns, weights)
        sortino = self._calculate_sortino_ratio(returns, weights)
        
        # Calculate maximum drawdown
        max_drawdown = self._calculate_max_drawdown(returns, weights)
        
        # Calculate beta if market returns are provided
        beta = self._calculate_beta(returns, weights) if len(returns) > 1 else None
        
        # Create correlation matrix if asset correlations provided
        correlation_matrix = self._format_correlation_matrix(asset_correlations) if asset_correlations is not None else None
        
        return RiskMetrics(
            portfolio_id=portfolio_id,
            timestamp=datetime.now(),
            volatility=float(portfolio_volatility),
            var_95=float(var_95),
            var_99=float(var_99),
            sharpe_ratio=float(sharpe),
            sortino_ratio=float(sortino) if sortino else None,
            max_drawdown=float(max_drawdown),
            beta=float(beta) if beta is not None else None,
            correlation_matrix=correlation_matrix
        )
    
    def _calculate_volatility(self, returns: np.ndarray, weights: np.ndarray) -> float:
        """Calculate portfolio volatility"""
        return np.sqrt(np.dot(weights.T, np.dot(np.cov(returns) * 252, weights)))
    
    def _calculate_var(self, returns: np.ndarray, weights: np.ndarray, confidence_level: float) -> float:
        """Calculate Value at Risk using historical simulation"""
        portfolio_returns = np.dot(returns.T, weights)
        return np.percentile(portfolio_returns, (1 - confidence_level) * 100) * np.sqrt(252)
    
    def _calculate_sharpe_ratio(self, returns: np.ndarray, weights: np.ndarray, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe Ratio"""
        portfolio_returns = np.dot(returns.T, weights)
        excess_returns = portfolio_returns - (risk_free_rate / 252)
        return np.mean(excess_returns) / np.std(portfolio_returns) * np.sqrt(252)
    
    def _calculate_sortino_ratio(self, returns: np.ndarray, weights: np.ndarray, risk_free_rate: float = 0.02) -> Optional[float]:
        """Calculate Sortino Ratio"""
        portfolio_returns = np.dot(returns.T, weights)
        excess_returns = portfolio_returns - (risk_free_rate / 252)
        downside_returns = portfolio_returns[portfolio_returns < 0]
        
        if len(downside_returns) == 0:
            return None
            
        downside_std = np.std(downside_returns)
        return np.mean(excess_returns) / downside_std * np.sqrt(252) if downside_std != 0 else None
    
    def _calculate_max_drawdown(self, returns: np.ndarray, weights: np.ndarray) -> float:
        """Calculate Maximum Drawdown"""
        portfolio_returns = np.dot(returns.T, weights)
        cumulative_returns = np.cumprod(1 + portfolio_returns)
        rolling_max = np.maximum.accumulate(cumulative_returns)
        drawdowns = cumulative_returns / rolling_max - 1
        return float(np.min(drawdowns))
    
    def _calculate_beta(self, returns: np.ndarray, weights: np.ndarray) -> float:
        """Calculate Portfolio Beta"""
        portfolio_returns = np.dot(returns.T, weights)
        market_returns = returns[-1]  # Assuming last row is market returns
        covariance = np.cov(portfolio_returns, market_returns)[0][1]
        market_variance = np.var(market_returns)
        return covariance / market_variance if market_variance != 0 else 1.0
    
    def _format_correlation_matrix(self, correlations: np.ndarray) -> Dict[str, Dict[str, float]]:
        """Format correlation matrix for API response"""
        num_assets = correlations.shape[0]
        assets = [f"asset_{i}" for i in range(num_assets)]
        
        correlation_dict = {}
        for i, asset_i in enumerate(assets):
            correlation_dict[asset_i] = {
                asset_j: float(correlations[i][j])
                for j, asset_j in enumerate(assets)
            }
        
        return correlation_dict