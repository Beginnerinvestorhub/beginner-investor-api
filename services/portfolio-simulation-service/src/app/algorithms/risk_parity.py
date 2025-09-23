import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import Dict, Optional, Tuple, List

from .base import PortfolioOptimizer, PortfolioWeights

class RiskParityOptimizer(PortfolioOptimizer):
    """
    Risk Parity portfolio optimization.
    
    Implements the risk parity approach that allocates risk equally among all assets
    in the portfolio, rather than allocating capital equally.
    """
    
    def __init__(
        self,
        returns: pd.DataFrame,
        risk_free_rate: float = 0.0,
        risk_weights: Optional[Dict[str, float]] = None,
        weight_bounds: Tuple[float, float] = (0, 1),
        max_iterations: int = 1000,
        risk_aversion: float = 1.0
    ):
        """
        Initialize the Risk Parity Optimizer.
        
        Args:
            returns: DataFrame with asset returns (rows=time, columns=assets)
            risk_free_rate: Annual risk-free rate (default: 0.0)
            risk_weights: Dictionary with custom risk weights for each asset.
                         If None, equal risk contribution is targeted.
            weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
            max_iterations: Maximum number of iterations for the optimizer
            risk_aversion: Risk aversion parameter (higher values result in more conservative allocations)
        """
        super().__init__(returns, risk_free_rate)
        self.risk_weights = risk_weights or {asset: 1.0/self.num_assets for asset in self.assets}
        self.weight_bounds = weight_bounds
        self.max_iterations = max_iterations
        self.risk_aversion = risk_aversion
        
        # Validate risk weights
        if not np.isclose(sum(self.risk_weights.values()), 1.0):
            raise ValueError("Risk weights must sum to 1.0")
    
    def _calculate_risk_contributions(self, weights: np.ndarray) -> np.ndarray:
        """
        Calculate the risk contribution of each asset.
        
        Args:
            weights: Portfolio weights
            
        Returns:
            Array of risk contributions for each asset
        """
        # Ensure weights sum to 1
        weights = weights / np.sum(weights)
        
        # Calculate portfolio volatility
        port_volatility = np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix, weights)))
        
        # Calculate marginal risk contribution
        mrc = np.dot(self.cov_matrix, weights) / (port_volatility + 1e-10)
        
        # Calculate risk contribution
        risk_contributions = weights * mrc
        
        return risk_contributions
    
    def _risk_parity_objective(self, weights: np.ndarray) -> float:
        """
        Objective function for risk parity optimization.
        
        Args:
            weights: Portfolio weights
            
        Returns:
            Risk parity objective value to be minimized
        """
        # Ensure weights sum to 1
        weights = weights / np.sum(weights)
        
        # Calculate risk contributions
        risk_contributions = self._calculate_risk_contributions(weights)
        
        # Calculate target risk contributions (from risk_weights)
        target_risk = np.array([self.risk_weights[asset] for asset in self.assets])
        
        # Calculate the risk parity objective
        # We want to minimize the sum of squared differences between actual and target risk contributions
        obj_value = np.sum((risk_contributions - target_risk) ** 2)
        
        # Add penalty for weights outside bounds
        penalty = 0
        if self.weight_bounds is not None:
            min_bound, max_bound = self.weight_bounds
            below_min = np.sum(np.maximum(0, min_bound - weights) ** 2)
            above_max = np.sum(np.maximum(0, weights - max_bound) ** 2)
            penalty = 1e6 * (below_min + above_max)  # Large penalty for constraint violation
        
        return obj_value + penalty
    
    def _check_sum_constraint(self, weights: np.ndarray) -> float:
        """Constraint: weights must sum to 1."""
        return np.sum(weights) - 1.0
    
    def optimize(self) -> PortfolioWeights:
        """
        Optimize portfolio weights using Risk Parity.
        
        Returns:
            PortfolioWeights object containing optimized weights and metrics
        """
        # Initial guess (equal weights)
        init_weights = np.array([1.0 / self.num_assets] * self.num_assets)
        
        # Define constraints
        constraints = [
            {'type': 'eq', 'fun': self._check_sum_constraint}
        ]
        
        # Define bounds for weights (default: no short selling)
        bounds = tuple(self.weight_bounds for _ in range(self.num_assets))
        
        # Optimize portfolio to achieve risk parity
        result = minimize(
            self._risk_parity_objective,
            init_weights,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints,
            options={'maxiter': self.max_iterations, 'ftol': 1e-9}
        )
        
        if not result.success:
            raise RuntimeError(f"Risk parity optimization failed: {result.message}")
        
        # Get optimized weights (ensuring they sum to 1)
        optimal_weights = result.x / np.sum(result.x)
        
        # Calculate portfolio metrics
        expected_return, volatility, sharpe_ratio = self.calculate_portfolio_metrics(optimal_weights)
        
        # Calculate risk contributions
        risk_contributions = self._calculate_risk_contributions(optimal_weights)
        risk_contribution_pct = {asset: float(contrib) 
                               for asset, contrib in zip(self.assets, risk_contributions)}
        
        # Create and return portfolio weights object with additional risk metrics
        portfolio = PortfolioWeights(
            weights=self.get_weights_dict(optimal_weights),
            expected_return=expected_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            risk_free_rate=self.risk_free_rate
        )
        
        # Add risk contribution information to the portfolio object
        portfolio.risk_contributions = risk_contribution_pct
        
        return portfolio


def calculate_risk_parity_weights(
    returns: pd.DataFrame,
    risk_free_rate: float = 0.0,
    risk_weights: Optional[Dict[str, float]] = None,
    weight_bounds: Tuple[float, float] = (0, 1),
    max_iterations: int = 1000,
    risk_aversion: float = 1.0
) -> Dict:
    """
    Calculate risk parity portfolio weights.
    
    Args:
        returns: DataFrame with asset returns (rows=time, columns=assets)
        risk_free_rate: Annual risk-free rate (default: 0.0)
        risk_weights: Dictionary with custom risk weights for each asset.
                     If None, equal risk contribution is targeted.
        weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
        max_iterations: Maximum number of iterations for the optimizer
        risk_aversion: Risk aversion parameter (higher values result in more conservative allocations)
        
    Returns:
        Dictionary with portfolio weights and metrics
    """
    # Initialize and run the risk parity optimizer
    rp = RiskParityOptimizer(
        returns=returns,
        risk_free_rate=risk_free_rate,
        risk_weights=risk_weights,
        weight_bounds=weight_bounds,
        max_iterations=max_iterations,
        risk_aversion=risk_aversion
    )
    
    # Get the optimized portfolio
    portfolio = rp.optimize()
    
    # Convert to dictionary with additional metrics
    result = {
        'weights': portfolio.weights,
        'metrics': {
            'expected_return': portfolio.expected_return,
            'volatility': portfolio.volatility,
            'sharpe_ratio': portfolio.sharpe_ratio,
            'risk_free_rate': portfolio.risk_free_rate
        },
        'risk_contributions': portfolio.risk_contributions
    }
    
    return result
