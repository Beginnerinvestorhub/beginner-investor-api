ureimport numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class RiskCalculator:
    """
    Service class for calculating various financial risk metrics.
    """
    
    @staticmethod
    def calculate_volatility(returns: List[float], annualize: bool = True) -> float:
        """
        Calculate the volatility (standard deviation) of returns.
        
        Args:
            returns: List of periodic returns
            annualize: Whether to annualize the volatility
            
        Returns:
            float: Volatility (standard deviation) of returns
        """
        if not returns:
            return 0.0
            
        volatility = np.std(returns, ddof=1)
        
        if annualize and len(returns) > 1:
            # Assuming 252 trading days in a year
            volatility *= np.sqrt(252 / len(returns))
            
        return float(volatility)
    
    @staticmethod
    def calculate_value_at_risk(returns: List[float], confidence_level: float = 0.95) -> float:
        """
        Calculate Value at Risk (VaR) using historical simulation.
        
        Args:
            returns: List of periodic returns
            confidence_level: Confidence level for VaR (e.g., 0.95 for 95%)
            
        Returns:
            float: Value at Risk as a percentage
        """
        if not returns:
            return 0.0
            
        return float(np.percentile(returns, (1 - confidence_level) * 100))
    
    @staticmethod
    def calculate_expected_shortfall(returns: List[float], confidence_level: float = 0.95) -> float:
        """
        Calculate Expected Shortfall (CVaR) using historical simulation.
        
        Args:
            returns: List of periodic returns
            confidence_level: Confidence level for ES (e.g., 0.95 for 95%)
            
        Returns:
            float: Expected Shortfall as a percentage
        """
        if not returns:
            return 0.0
            
        var = RiskCalculator.calculate_value_at_risk(returns, confidence_level)
        return float(np.mean([r for r in returns if r <= var]))
    
    @staticmethod
    def calculate_sharpe_ratio(returns: List[float], risk_free_rate: float = 0.02) -> float:
        """
        Calculate the Sharpe ratio.
        
        Args:
            returns: List of periodic returns
            risk_free_rate: Annual risk-free rate (default: 2%)
            
        Returns:
            float: Sharpe ratio
        """
        if not returns or np.std(returns) == 0:
            return 0.0
            
        excess_returns = np.array(returns) - (risk_free_rate / 252)  # Daily risk-free rate
        return float(np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252))
    
    @staticmethod
    def calculate_max_drawdown(returns: List[float]) -> float:
        """
        Calculate maximum drawdown.
        
        Args:
            returns: List of periodic returns
            
        Returns:
            float: Maximum drawdown as a percentage
        """
        if not returns:
            return 0.0
            
        cumulative_returns = np.cumprod([1 + r for r in returns]) - 1
        peak = cumulative_returns[0]
        max_drawdown = 0.0
        
        for ret in cumulative_returns:
            if ret > peak:
                peak = ret
            drawdown = (peak - ret) / (1 + peak)
            if drawdown > max_drawdown:
                max_drawdown = drawdown
                
        return float(max_drawdown)
    
    @staticmethod
    def calculate_beta(asset_returns: List[float], market_returns: List[float]) -> float:
        """
        Calculate beta of an asset relative to the market.
        
        Args:
            asset_returns: List of asset returns
            market_returns: List of market returns (same period as asset_returns)
            
        Returns:
            float: Beta coefficient
        """
        if len(asset_returns) != len(market_returns) or len(asset_returns) < 2:
            return 1.0  # Default to market beta if not enough data
            
        covariance = np.cov(asset_returns, market_returns)[0][1]
        market_variance = np.var(market_returns, ddof=1)
        
        return float(covariance / market_variance if market_variance != 0 else 1.0)

# Example usage
if __name__ == "__main__":
    # Example returns (daily returns as decimals, e.g., 0.01 for 1%)
    returns = [0.01, -0.02, 0.015, -0.01, 0.03, -0.005, 0.02]
    
    rc = RiskCalculator()
    print(f"Volatility: {rc.calculate_volatility(returns):.4f}")
    print(f"VaR (95%): {rc.calculate_value_at_risk(returns):.4f}")
    print(f"Expected Shortfall (95%): {rc.calculate_expected_shortfall(returns):.4f}")
    print(f"Sharpe Ratio: {rc.calculate_sharpe_ratio(returns):.4f}")
    print(f"Max Drawdown: {rc.calculate_max_drawdown(returns):.4f}")
