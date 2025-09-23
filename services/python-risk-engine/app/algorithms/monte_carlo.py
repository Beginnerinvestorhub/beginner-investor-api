import numpy as np
from typing import List, Tuple, Dict, Optional
import numpy.typing as npt
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class MonteCarloSimulation:
    """
    A class for running Monte Carlo simulations for financial risk analysis.
    """
    
    def __init__(self, n_simulations: int = 10000, random_seed: Optional[int] = None):
        """
        Initialize the Monte Carlo simulation.
        
        Args:
            n_simulations: Number of simulations to run
            random_seed: Random seed for reproducibility
        """
        self.n_simulations = n_simulations
        if random_seed is not None:
            np.random.seed(random_seed)
    
    def simulate_returns(
        self,
        initial_price: float,
        mu: float,
        sigma: float,
        time_horizon: int = 252,
        dt: float = 1.0
    ) -> npt.NDArray[np.float64]:
        """
        Simulate geometric Brownian motion for stock price returns.
        
        Args:
            initial_price: Initial price of the asset
            mu: Expected annual return (drift)
            sigma: Annualized volatility
            time_horizon: Number of time steps to simulate
            dt: Time step in years (default: 1 day = 1/252)
            
        Returns:
            Array of simulated price paths (n_simulations x time_horizon+1)
        """
        # Convert annual parameters to per-time-step
        mu_per_step = mu * dt
        sigma_per_step = sigma * np.sqrt(dt)
        
        # Generate random numbers for the simulation
        random_numbers = np.random.normal(
            loc=(mu_per_step - 0.5 * sigma_per_step**2),
            scale=sigma_per_step,
            size=(self.n_simulations, time_horizon)
        )
        
        # Calculate cumulative returns
        cum_returns = np.exp(random_numbers.cumsum(axis=1))
        
        # Apply initial price
        price_paths = np.ones((self.n_simulations, time_horizon + 1)) * initial_price
        price_paths[:, 1:] *= cum_returns
        
        return price_paths
    
    def simulate_portfolio(
        self,
        initial_weights: npt.ArrayLike,
        expected_returns: npt.ArrayLike,
        cov_matrix: npt.ArrayLike,
        time_horizon: int = 252,
        dt: float = 1.0,
        initial_value: float = 1.0
    ) -> Dict[str, npt.NDArray[np.float64]]:
        """
        Simulate a portfolio with multiple assets using Cholesky decomposition.
        
        Args:
            initial_weights: Initial weights of assets in the portfolio
            expected_returns: Expected annual returns for each asset
            cov_matrix: Covariance matrix of asset returns
            time_horizon: Number of time steps to simulate
            dt: Time step in years (default: 1 day = 1/252)
            initial_value: Initial portfolio value
            
        Returns:
            Dictionary containing:
                - 'values': Simulated portfolio values (n_simulations x time_horizon+1)
                - 'weights': Asset weights over time (n_assets x n_simulations x time_horizon+1)
                - 'returns': Portfolio returns (n_simulations x time_horizon)
        """
        n_assets = len(initial_weights)
        weights = np.zeros((n_assets, self.n_simulations, time_horizon + 1))
        weights[..., 0] = np.array(initial_weights).reshape(-1, 1) * np.ones((n_assets, self.n_simulations))
        
        # Calculate Cholesky decomposition of the covariance matrix
        try:
            L = np.linalg.cholesky(cov_matrix)
        except np.linalg.LinAlgError:
            # If matrix is not positive definite, use the nearest positive definite matrix
            L = self._nearest_pd_cholesky(cov_matrix)
        
        # Generate correlated random numbers
        uncorrelated_random = np.random.normal(
            size=(self.n_simulations, time_horizon, n_assets)
        )
        correlated_random = np.einsum('ij,klj->kli', L, uncorrelated_random)
        
        # Calculate returns for each asset
        dt_sqrt = np.sqrt(dt)
        drift = (expected_returns - 0.5 * np.diag(cov_matrix)) * dt
        diffusion = correlated_random * dt_sqrt
        
        # Calculate price paths
        log_returns = np.expand_dims(drift, axis=(0, 1)) + diffusion
        cum_returns = np.exp(np.cumsum(log_returns, axis=1))
        
        # Initialize portfolio values
        values = np.ones((self.n_simulations, time_horizon + 1)) * initial_value
        
        # Simulate over time
        for t in range(1, time_horizon + 1):
            # Update asset values
            asset_values = values[:, t-1:t] * weights[..., t-1].T * (1 + log_returns[:, t-1])
            values[:, t] = np.sum(asset_values, axis=1)
            
            # Update weights (buy and hold strategy)
            if t < time_horizon:
                weights[..., t] = (asset_values / values[:, t:t+1]).T
        
        # Calculate portfolio returns
        returns = values[:, 1:] / values[:, :-1] - 1
        
        return {
            'values': values,
            'weights': weights,
            'returns': returns
        }
    
    def calculate_var(
        self,
        returns: npt.ArrayLike,
        confidence_level: float = 0.95
    ) -> float:
        """
        Calculate Value at Risk (VaR) from simulated returns.
        
        Args:
            returns: Array of simulated returns
            confidence_level: Confidence level for VaR (e.g., 0.95 for 95%)
            
        Returns:
            Value at Risk as a percentage
        """
        return float(np.percentile(returns, (1 - confidence_level) * 100))
    
    def calculate_cvar(
        self,
        returns: npt.ArrayLike,
        confidence_level: float = 0.95
    ) -> float:
        """
        Calculate Conditional Value at Risk (CVaR) from simulated returns.
        
        Args:
            returns: Array of simulated returns
            confidence_level: Confidence level for CVaR (e.g., 0.95 for 95%)
            
        Returns:
            Conditional Value at Risk as a percentage
        """
        var = self.calculate_var(returns, confidence_level)
        return float(returns[returns <= var].mean())
    
    def _nearest_pd_cholesky(self, A: npt.NDArray[np.float64]) -> npt.NDArray[np.float64]:
        """
        Find the nearest positive-definite matrix and return its Cholesky decomposition.
        
        Args:
            A: Input matrix
            
        Returns:
            Cholesky decomposition of the nearest positive-definite matrix
        """
        # Symmetrize the matrix
        B = (A + A.T) / 2
        
        # Compute the symmetric polar factor of B
        _, s, V = np.linalg.svd(B)
        H = V.T @ np.diag(s) @ V
        
        # Form the corrected matrix
        A2 = (B + H) / 2
        
        # Ensure symmetry
        A3 = (A2 + A2.T) / 2
        
        # Add small multiple of identity if needed
        I = np.eye(A.shape[0])
        k = 1
        while True:
            try:
                L = np.linalg.cholesky(A3 + k * I * np.finfo(A3.dtype).eps)
                return L
            except np.linalg.LinAlgError:
                k *= 2

# Example usage
if __name__ == "__main__":
    # Example: Simulate a single stock
    mc = MonteCarloSimulation(n_simulations=1000, random_seed=42)
    
    # Parameters for simulation
    initial_price = 100.0
    mu = 0.08  # 8% expected annual return
    sigma = 0.2  # 20% annual volatility
    
    # Run simulation
    price_paths = mc.simulate_returns(
        initial_price=initial_price,
        mu=mu,
        sigma=sigma,
        time_horizon=252  # 1 year of daily data
    )
    
    # Calculate statistics
    final_prices = price_paths[:, -1]
    mean_final_price = np.mean(final_prices)
    median_final_price = np.median(final_prices)
    
    print(f"Initial price: {initial_price:.2f}")
    print(f"Mean final price: {mean_final_price:.2f}")
    print(f"Median final price: {median_final_price:.2f}")
    
    # Calculate VaR and CVaR
    returns = (final_prices - initial_price) / initial_price
    var_95 = mc.calculate_var(returns, 0.95)
    cvar_95 = mc.calculate_cvar(returns, 0.95)
    
    print(f"95% VaR: {var_95*100:.2f}%")
    print(f"95% CVaR: {cvar_95*100:.2f}%")
