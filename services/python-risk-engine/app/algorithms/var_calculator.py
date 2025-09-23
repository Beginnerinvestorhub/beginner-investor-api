import numpy as np
from typing import List, Dict, Optional, Union, Tuple
import pandas as pd
from scipy.stats import norm, t, skew, kurtosis
import logging

logger = logging.getLogger(__name__)

class VaRCalculator:
    """
    A class for calculating Value at Risk (VaR) using various methods.
    """
    
    @staticmethod
    def historical_var(
        returns: Union[List[float], np.ndarray], 
        confidence_level: float = 0.95,
        is_pct: bool = True
    ) -> float:
        """
        Calculate Value at Risk using historical simulation.
        
        Args:
            returns: Array of historical returns
            confidence_level: Confidence level for VaR (e.g., 0.95 for 95%)
            is_pct: Whether returns are in percentage form (e.g., 1.5 for 1.5%)
            
        Returns:
            Value at Risk as a percentage
        """
        if not isinstance(returns, np.ndarray):
            returns = np.array(returns)
            
        if not is_pct:
            returns = returns * 100  # Convert to percentage
            
        if len(returns) == 0:
            return 0.0
            
        return float(np.percentile(returns, (1 - confidence_level) * 100))
    
    @staticmethod
    def parametric_var(
        returns: Union[List[float], np.ndarray],
        confidence_level: float = 0.95,
        is_pct: bool = True,
        distribution: str = 'normal'
    ) -> float:
        """
        Calculate Value at Risk using parametric (variance-covariance) method.
        
        Args:
            returns: Array of historical returns
            confidence_level: Confidence level for VaR (e.g., 0.95 for 95%)
            is_pct: Whether returns are in percentage form (e.g., 1.5 for 1.5%)
            distribution: Distribution assumption ('normal' or 't' for Student's t)
            
        Returns:
            Value at Risk as a percentage
        """
        if not isinstance(returns, np.ndarray):
            returns = np.array(returns)
            
        if not is_pct:
            returns = returns * 100  # Convert to percentage
            
        if len(returns) < 2:
            return 0.0
            
        mean = np.mean(returns)
        std_dev = np.std(returns, ddof=1)
        
        if distribution.lower() == 'normal':
            z_score = norm.ppf(1 - confidence_level)
            var = mean + z_score * std_dev
        elif distribution.lower() == 't':
            # Fit t-distribution
            df, loc, scale = t.fit(returns)
            var = t.ppf(1 - confidence_level, df, loc, scale)
        else:
            raise ValueError(f"Unsupported distribution: {distribution}")
            
        return float(var)
    
    @staticmethod
    def modified_var(
        returns: Union[List[float], np.ndarray],
        confidence_level: float = 0.95,
        is_pct: bool = True
    ) -> float:
        """
        Calculate Modified Value at Risk (Cornish-Fisher expansion).
        Accounts for skewness and kurtosis in the return distribution.
        
        Args:
            returns: Array of historical returns
            confidence_level: Confidence level for VaR (e.g., 0.95 for 95%)
            is_pct: Whether returns are in percentage form (e.g., 1.5 for 1.5%)
            
        Returns:
            Modified Value at Risk as a percentage
        """
        if not isinstance(returns, np.ndarray):
            returns = np.array(returns)
            
        if not is_pct:
            returns = returns * 100  # Convert to percentage
            
        if len(returns) < 4:  # Need at least 4 points for meaningful moments
            return VaRCalculator.parametric_var(returns, confidence_level, is_pct=True)
            
        mean = np.mean(returns)
        std_dev = np.std(returns, ddof=1)
        skewness = skew(returns, bias=False)
        excess_kurtosis = kurtosis(returns, bias=False, fisher=False) - 3
        
        # Cornish-Fisher expansion terms
        z = norm.ppf(1 - confidence_level)
        z_sq = z ** 2
        
        # Calculate modified z-score
        modified_z = (z +
                     (z_sq - 1) * skewness / 6 +
                     (z ** 3 - 3 * z) * excess_kurtosis / 24 -
                     (2 * z ** 3 - 5 * z) * (skewness ** 2) / 36)
        
        var = mean + modified_z * std_dev
        return float(var)
    
    @staticmethod
    def conditional_var(
        returns: Union[List[float], np.ndarray],
        confidence_level: float = 0.95,
        method: str = 'historical',
        **kwargs
    ) -> float:
        """
        Calculate Conditional Value at Risk (CVaR) or Expected Shortfall.
        
        Args:
            returns: Array of historical returns
            confidence_level: Confidence level for CVaR (e.g., 0.95 for 95%)
            method: Calculation method ('historical', 'parametric', 'modified')
            **kwargs: Additional arguments for the specific method
            
        Returns:
            Conditional Value at Risk as a percentage
        """
        if method == 'historical':
            var = VaRCalculator.historical_var(returns, confidence_level, **kwargs)
            if not isinstance(returns, np.ndarray):
                returns = np.array(returns)
            
            # Filter returns that are worse than the VaR threshold
            tail_returns = returns[returns <= var]
            return float(np.mean(tail_returns) if len(tail_returns) > 0 else var)
            
        elif method == 'parametric':
            # For normal distribution, CVaR has a closed-form solution
            mean = np.mean(returns)
            std_dev = np.std(returns, ddof=1)
            alpha = 1 - confidence_level
            
            # Calculate the standard normal pdf and cdf at the VaR point
            z_alpha = norm.ppf(alpha)
            cvar = mean - std_dev * norm.pdf(z_alpha) / alpha
            return float(cvar)
            
        elif method == 'modified':
            # For modified VaR, we'll use the historical approach on the modified distribution
            var = VaRCalculator.modified_var(returns, confidence_level, **kwargs)
            if not isinstance(returns, np.ndarray):
                returns = np.array(returns)
                
            # This is an approximation since we don't have the full modified distribution
            tail_returns = returns[returns <= var]
            return float(np.mean(tail_returns) if len(tail_returns) > 0 else var)
            
        else:
            raise ValueError(f"Unsupported CVaR method: {method}")
    
    @staticmethod
    def calculate_var(
        returns: Union[List[float], np.ndarray],
        confidence_level: float = 0.95,
        method: str = 'historical',
        **kwargs
    ) -> Dict[str, float]:
        """
        Calculate Value at Risk using the specified method.
        
        Args:
            returns: Array of historical returns
            confidence_level: Confidence level for VaR (e.g., 0.95 for 95%)
            method: Calculation method ('historical', 'parametric', 'modified')
            **kwargs: Additional arguments for the specific method
            
        Returns:
            Dictionary containing VaR and related metrics
        """
        if method == 'historical':
            var = VaRCalculator.historical_var(returns, confidence_level, **kwargs)
        elif method == 'parametric':
            var = VaRCalculator.parametric_var(returns, confidence_level, **kwargs)
        elif method == 'modified':
            var = VaRCalculator.modified_var(returns, confidence_level, **kwargs)
        else:
            raise ValueError(f"Unsupported VaR method: {method}")
        
        # Calculate CVaR using the same method for consistency
        cvar = VaRCalculator.conditional_var(
            returns, 
            confidence_level=confidence_level, 
            method=method,
            **kwargs
        )
        
        return {
            'var': var,
            'cvar': cvar,
            'confidence_level': confidence_level,
            'method': method
        }

# Example usage
if __name__ == "__main__":
    # Example returns (monthly returns in percentage)
    returns = [
        2.3, -1.2, 3.4, 0.5, -2.1, 1.8, -0.9, 1.2, -3.4, 2.5,
        1.1, -0.8, -2.2, 1.5, 0.9, -1.7, 2.8, -0.5, 1.9, -2.5
    ]
    
    # Initialize calculator
    var_calc = VaRCalculator()
    
    # Calculate VaR using different methods
    methods = ['historical', 'parametric', 'modified']
    confidence = 0.95
    
    print(f"Calculating {confidence*100:.0f}% VaR for the given returns:")
    print("-" * 50)
    
    for method in methods:
        try:
            result = var_calc.calculate_var(
                returns=returns,
                confidence_level=confidence,
                method=method,
                is_pct=True
            )
            print(f"{method.upper()} VaR: {result['var']:.2f}%")
            print(f"{method.upper()} CVaR: {result['cvar']:.2f}%")
            print("-" * 50)
        except Exception as e:
            print(f"Error calculating {method} VaR: {str(e)}")
            print("-" * 50)
