import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import Dict, Optional, Tuple

from .base import PortfolioOptimizer, PortfolioWeights

class MeanVarianceOptimizer(PortfolioOptimizer):
    """
    Mean-Variance Optimization (MVO) for portfolio construction.
    
    Implements the classic Markowitz portfolio optimization that finds the optimal
    asset allocation by maximizing the Sharpe ratio (risk-adjusted return).
    """
    
    def __init__(
        self, 
        returns: pd.DataFrame, 
        risk_free_rate: float = 0.0,
        target_return: Optional[float] = None,
        target_volatility: Optional[float] = None,
        weight_bounds: Tuple[float, float] = (0, 1),
        max_iterations: int = 1000
    ):
        """
        Initialize the Mean-Variance Optimizer.
        
        Args:
            returns: DataFrame with asset returns (rows=time, columns=assets)
            risk_free_rate: Annual risk-free rate (default: 0.0)
            target_return: If provided, optimize for minimum variance with this target return
            target_volatility: If provided, optimize for maximum return with this target volatility
            weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
            max_iterations: Maximum number of iterations for the optimizer
        """
        super().__init__(returns, risk_free_rate)
        self.target_return = target_return
        self.target_volatility = target_volatility
        self.weight_bounds = weight_bounds
        self.max_iterations = max_iterations
        
        # Validate that only one target is provided
        if target_return is not None and target_volatility is not None:
            raise ValueError("Cannot specify both target_return and target_volatility")
    
    def _neg_sharpe_ratio(self, weights: np.ndarray) -> float:
        """Calculate the negative Sharpe ratio for minimization."""
        _, volatility, sharpe = self.calculate_portfolio_metrics(weights)
        return -sharpe
    
    def _portfolio_volatility(self, weights: np.ndarray) -> float:
        """Calculate portfolio volatility for a given set of weights."""
        return np.sqrt(np.dot(weights.T, np.dot(self.cov_matrix, weights)))
    
    def _portfolio_return(self, weights: np.ndarray) -> float:
        """Calculate portfolio return for a given set of weights."""
        return np.sum(self.expected_returns * weights)
    
    def _check_sum_constraint(self, weights: np.ndarray) -> float:
        """Constraint: weights must sum to 1."""
        return np.sum(weights) - 1.0
    
    def optimize(self) -> PortfolioWeights:
        """
        Optimize portfolio weights using Mean-Variance Optimization.
        
        Returns:
            PortfolioWeights object containing optimized weights and metrics
        """
        # Initial guess (equal weights)
        init_weights = np.array([1.0 / self.num_assets] * self.num_assets)
        
        # Define constraints
        constraints = [
            {'type': 'eq', 'fun': self._check_sum_constraint}
        ]
        
        # Add target return constraint if specified
        if self.target_return is not None:
            constraints.append(
                {'type': 'eq', 'fun': lambda w: self._portfolio_return(w) - self.target_return}
            )
        
        # Add target volatility constraint if specified
        if self.target_volatility is not None:
            constraints.append(
                {'type': 'eq', 'fun': lambda w: self._portfolio_volatility(w) - self.target_volatility}
            )
        
        # Define bounds for weights (default: no short selling)
        bounds = tuple(self.weight_bounds for _ in range(self.num_assets))
        
        # Optimize portfolio
        if self.target_return is not None:
            # Minimize volatility with target return
            result = minimize(
                self._portfolio_volatility,
                init_weights,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints,
                options={'maxiter': self.max_iterations}
            )
        elif self.target_volatility is not None:
            # Maximize return with target volatility
            result = minimize(
                lambda w: -self._portfolio_return(w),
                init_weights,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints,
                options={'maxiter': self.max_iterations}
            )
        else:
            # Maximize Sharpe ratio (default)
            result = minimize(
                self._neg_sharpe_ratio,
                init_weights,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints,
                options={'maxiter': self.max_iterations}
            )
        
        if not result.success:
            raise RuntimeError(f"Portfolio optimization failed: {result.message}")
        
        # Get optimized weights
        optimal_weights = result.x / np.sum(result.x)  # Ensure weights sum to 1
        
        # Calculate portfolio metrics
        expected_return, volatility, sharpe_ratio = self.calculate_portfolio_metrics(optimal_weights)
        
        # Create and return portfolio weights object
        return PortfolioWeights(
            weights=self.get_weights_dict(optimal_weights),
            expected_return=expected_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            risk_free_rate=self.risk_free_rate
        )


def calculate_efficient_frontier(
    returns: pd.DataFrame,
    risk_free_rate: float = 0.0,
    num_points: int = 20,
    weight_bounds: Tuple[float, float] = (0, 1)
) -> Dict[str, Dict]:
    """
    Calculate the efficient frontier for a set of assets.
    
    Args:
        returns: DataFrame with asset returns (rows=time, columns=assets)
        risk_free_rate: Annual risk-free rate (default: 0.0)
        num_points: Number of points to calculate on the efficient frontier
        weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
        
    Returns:
        Dictionary with efficient frontier data points
    """
    # Calculate minimum variance portfolio
    min_vol_port = MeanVarianceOptimizer(
        returns=returns,
        risk_free_rate=risk_free_rate,
        weight_bounds=weight_bounds
    ).optimize()
    
    # Calculate maximum return portfolio
    max_ret_port = MeanVarianceOptimizer(
        returns=returns,
        risk_free_rate=risk_free_rate,
        weight_bounds=weight_bounds
    )
    max_ret_port.target_return = max_ret_port.expected_returns.max()
    max_ret_port = max_ret_port.optimize()
    
    # Generate target returns between min and max
    target_returns = np.linspace(
        min_vol_port.expected_return,
        max_ret_port.expected_return,
        num_points
    )
    
    # Calculate efficient frontier points
    frontier_points = []
    for target_ret in target_returns:
        try:
            mvo = MeanVarianceOptimizer(
                returns=returns,
                risk_free_rate=risk_free_rate,
                target_return=target_ret,
                weight_bounds=weight_bounds
            )
            port = mvo.optimize()
            frontier_points.append({
                'expected_return': port.expected_return,
                'volatility': port.volatility,
                'sharpe_ratio': port.sharpe_ratio,
                'weights': port.weights
            })
        except Exception as e:
            print(f"Skipping target return {target_ret}: {str(e)}")
    
    # Add the maximum return portfolio if not already included
    if not any(p['expected_return'] == max_ret_port.expected_return for p in frontier_points):
        frontier_points.append({
            'expected_return': max_ret_port.expected_return,
            'volatility': max_ret_port.volatility,
            'sharpe_ratio': max_ret_port.sharpe_ratio,
            'weights': max_ret_port.weights
        })
    
    # Sort by volatility
    frontier_points.sort(key=lambda x: x['volatility'])
    
    # Find the tangency portfolio (maximum Sharpe ratio)
    tangency_port = max(frontier_points, key=lambda x: x['sharpe_ratio'])
    
    return {
        'frontier': frontier_points,
        'min_volatility': {
            'expected_return': min_vol_port.expected_return,
            'volatility': min_vol_port.volatility,
            'sharpe_ratio': min_vol_port.sharpe_ratio,
            'weights': min_vol_port.weights
        },
        'max_return': {
            'expected_return': max_ret_port.expected_return,
            'volatility': max_ret_port.volatility,
            'sharpe_ratio': max_ret_port.sharpe_ratio,
            'weights': max_ret_port.weights
        },
        'tangency': tangency_port,
        'risk_free_rate': risk_free_rate
    }
