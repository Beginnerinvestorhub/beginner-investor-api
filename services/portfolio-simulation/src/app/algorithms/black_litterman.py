import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass

from .base import PortfolioOptimizer, PortfolioWeights

@dataclass
class View:
    """Data class representing a single investor view."""
    assets: List[str]  # List of assets in the view
    weights: List[float]  # Weights for each asset in the view
    return_value: float  # Expected return for the view
    confidence: float  # Confidence level (0-1)
    
    def __post_init__(self):
        # Normalize weights to sum to 1
        total = sum(self.weights)
        if not np.isclose(total, 0):
            self.weights = [w / total for w in self.weights]


class BlackLittermanOptimizer(PortfolioOptimizer):
    """
    Black-Litterman model for portfolio optimization.
    
    Combines market equilibrium returns with investor views to produce
    more intuitive portfolio allocations.
    """
    
    def __init__(
        self,
        returns: pd.DataFrame,
        market_caps: Optional[Dict[str, float]] = None,
        risk_aversion: float = 2.5,
        tau: float = 0.05,
        risk_free_rate: float = 0.0,
        weight_bounds: Tuple[float, float] = (0, 1),
        max_iterations: int = 1000
    ):
        """
        Initialize the Black-Litterman Optimizer.
        
        Args:
            returns: DataFrame with asset returns (rows=time, columns=assets)
            market_caps: Dictionary of market capitalizations for each asset.
                        If None, equal market weights are assumed.
            risk_aversion: Risk aversion parameter (lambda) for the market portfolio
            tau: Scaling factor for the uncertainty in the prior (0-1)
            risk_free_rate: Annual risk-free rate (default: 0.0)
            weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
            max_iterations: Maximum number of iterations for the optimizer
        """
        super().__init__(returns, risk_free_rate)
        self.risk_aversion = risk_aversion
        self.tau = tau
        self.weight_bounds = weight_bounds
        self.max_iterations = max_iterations
        
        # Calculate market equilibrium returns (prior)
        self.market_weights = self._calculate_market_weights(market_caps)
        self.equilibrium_returns = self._calculate_equilibrium_returns()
        
    def _calculate_market_weights(self, market_caps: Optional[Dict[str, float]]) -> np.ndarray:
        """Calculate market capitalization weights."""
        if market_caps is None:
            # If no market caps provided, assume equal weights
            return np.ones(self.num_assets) / self.num_assets
        
        # Convert market caps to numpy array in the same order as self.assets
        market_caps_array = np.array([market_caps.get(asset, 0.0) for asset in self.assets])
        
        # Handle zero or negative market caps
        if np.any(market_caps_array <= 0):
            raise ValueError("Market capitalizations must be positive")
        
        # Normalize to sum to 1
        return market_caps_array / np.sum(market_caps_array)
    
    def _calculate_equilibrium_returns(self) -> np.ndarray:
        """Calculate equilibrium returns using reverse optimization."""
        # Π = λ * Σ * w_mkt
        # Where:
        #   Π = equilibrium excess returns
        #   λ = risk aversion coefficient
        #   Σ = covariance matrix
        #   w_mkt = market capitalization weights
        return self.risk_aversion * np.dot(self.cov_matrix, self.market_weights)
    
    def _create_view_matrices(self, views: List[View]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Create view matrices for the Black-Litterman model.
        
        Args:
            views: List of View objects representing investor views
            
        Returns:
            Tuple of (P, Q, Omega) matrices
            - P: Pick matrix (k x n) where k is number of views, n is number of assets
            - Q: View return vector (k x 1)
            - Omega: Uncertainty matrix (k x k)
        """
        k = len(views)
        n = self.num_assets
        
        # Initialize matrices
        P = np.zeros((k, n))
        Q = np.zeros(k)
        Omega = np.zeros((k, k))
        
        for i, view in enumerate(views):
            # Create the pick vector for this view
            for asset, weight in zip(view.assets, view.weights):
                if asset in self.assets:
                    j = self.assets.index(asset)
                    P[i, j] = weight
            
            # Set the view return
            Q[i] = view.return_value
            
            # Set the uncertainty (confidence) for this view
            # Higher confidence = lower variance
            if view.confidence <= 0 or view.confidence > 1:
                raise ValueError("Confidence must be between 0 and 1")
            Omega[i, i] = 1.0 / (view.confidence + 1e-8)  # Avoid division by zero
        
        return P, Q, Omega
    
    def combine_views(
        self,
        views: List[View],
        tau: Optional[float] = None
    ) -> np.ndarray:
        """
        Combine market equilibrium with investor views.
        
        Args:
            views: List of View objects representing investor views
            tau: Scaling factor for the uncertainty in the prior (optional)
            
        Returns:
            Posterior expected returns (n x 1)
        """
        tau = tau or self.tau
        
        # Create view matrices
        P, Q, Omega = self._create_view_matrices(views)
        k = len(views)
        
        if k == 0:
            # No views, return equilibrium returns
            return self.equilibrium_returns
        
        # Calculate the uncertainty in the prior
        # Σ_pi = τΣ
        sigma_pi = tau * self.cov_matrix
        
        # Calculate the posterior estimate of the mean
        # μ = [(τΣ)^-1 + P'Ω^-1 P]^-1 * [(τΣ)^-1 * Π + P'Ω^-1 Q]
        # Where:
        #   μ = posterior returns
        #   Π = equilibrium returns
        #   P = pick matrix
        #   Q = view returns
        #   Ω = uncertainty matrix
        
        # Calculate (τΣ)^-1
        tau_sigma_inv = np.linalg.inv(sigma_pi)
        
        # Calculate Ω^-1
        omega_inv = np.linalg.inv(Omega)
        
        # Calculate the first term: (τΣ)^-1 * Π
        first_term = np.dot(tau_sigma_inv, self.equilibrium_returns)
        
        # Calculate the second term: P' * Ω^-1 * Q
        second_term = np.dot(np.dot(P.T, omega_inv), Q)
        
        # Calculate the coefficient matrix: (τΣ)^-1 + P'Ω^-1 P
        coef_matrix = tau_sigma_inv + np.dot(np.dot(P.T, omega_inv), P)
        
        # Solve for μ
        mu = np.linalg.solve(coef_matrix, first_term + second_term)
        
        return mu
    
    def optimize(
        self,
        views: Optional[List[View]] = None,
        tau: Optional[float] = None
    ) -> PortfolioWeights:
        """
        Optimize portfolio weights using the Black-Litterman model.
        
        Args:
            views: List of View objects (if None, uses market equilibrium)
            tau: Scaling factor for the uncertainty in the prior (optional)
            
        Returns:
            PortfolioWeights object containing optimized weights and metrics
        """
        views = views or []
        tau = tau or self.tau
        
        # Calculate posterior returns
        posterior_returns = self.combine_views(views, tau)
        
        # Create a mean-variance optimizer with the posterior returns
        # We'll use the same covariance matrix but replace the expected returns
        class BLPortfolioOptimizer(PortfolioOptimizer):
            def _calculate_expected_returns(self):
                return posterior_returns
            
            def optimize(self):
                # This is a placeholder - we'll use the parent's optimize method
                pass
        
        # Create the optimizer with the posterior returns
        bl_optimizer = BLPortfolioOptimizer(self.returns, self.risk_free_rate)
        
        # We need to set the covariance matrix (since we overrode _calculate_expected_returns)
        bl_optimizer.cov_matrix = self.cov_matrix
        
        # Now use mean-variance optimization with the posterior returns
        # We'll maximize the Sharpe ratio by default
        mvo = MeanVarianceOptimizer(
            returns=self.returns,
            risk_free_rate=self.risk_free_rate,
            weight_bounds=self.weight_bounds
        )
        
        # Replace the expected returns with our posterior estimates
        mvo.expected_returns = posterior_returns
        
        # Optimize the portfolio
        return mvo.optimize()


def calculate_black_litterman_weights(
    returns: pd.DataFrame,
    market_caps: Optional[Dict[str, float]] = None,
    views: Optional[List[View]] = None,
    risk_aversion: float = 2.5,
    tau: float = 0.05,
    risk_free_rate: float = 0.0,
    weight_bounds: Tuple[float, float] = (0, 1),
    max_iterations: int = 1000
) -> Dict:
    """
    Calculate portfolio weights using the Black-Litterman model.
    
    Args:
        returns: DataFrame with asset returns (rows=time, columns=assets)
        market_caps: Dictionary of market capitalizations for each asset.
                    If None, equal market weights are assumed.
        views: List of View objects representing investor views
        risk_aversion: Risk aversion parameter (lambda) for the market portfolio
        tau: Scaling factor for the uncertainty in the prior (0-1)
        risk_free_rate: Annual risk-free rate (default: 0.0)
        weight_bounds: Bounds for asset weights (default: 0 to 1, no short selling)
        max_iterations: Maximum number of iterations for the optimizer
        
    Returns:
        Dictionary with portfolio weights and metrics
    """
    # Initialize and run the Black-Litterman optimizer
    bl = BlackLittermanOptimizer(
        returns=returns,
        market_caps=market_caps,
        risk_aversion=risk_aversion,
        tau=tau,
        risk_free_rate=risk_free_rate,
        weight_bounds=weight_bounds,
        max_iterations=max_iterations
    )
    
    # Get the optimized portfolio
    portfolio = bl.optimize(views=views, tau=tau)
    
    # Convert to dictionary with additional metrics
    result = {
        'weights': portfolio.weights,
        'metrics': {
            'expected_return': portfolio.expected_return,
            'volatility': portfolio.volatility,
            'sharpe_ratio': portfolio.sharpe_ratio,
            'risk_free_rate': portfolio.risk_free_rate
        },
        'equilibrium_returns': {asset: float(ret) for asset, ret in zip(bl.assets, bl.equilibrium_returns)}
    }
    
    return result
