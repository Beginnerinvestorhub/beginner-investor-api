import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

@dataclass
class MonteCarloResult:
    simulated_returns: np.ndarray
    confidence_intervals: Dict[str, Tuple[float, float]]
    value_at_risk: Dict[str, float]
    expected_return: float
    volatility: float

class MonteCarloSimulation:
    """Monte Carlo simulation for portfolio analysis"""
    
    def __init__(
        self,
        num_simulations: int = 10000,
        time_horizon: int = 252,  # One trading year
        confidence_levels: List[float] = [0.90, 0.95, 0.99]
    ):
        self.num_simulations = num_simulations
        self.time_horizon = time_horizon
        self.confidence_levels = confidence_levels
    
    def run_simulation(
        self,
        returns: np.ndarray,
        weights: np.ndarray,
        initial_value: float = 10000.0
    ) -> MonteCarloResult:
        """Run Monte Carlo simulation for portfolio returns"""
        
        # Calculate portfolio parameters
        portfolio_returns = np.dot(returns, weights)
        mean_return = np.mean(portfolio_returns)
        volatility = np.std(portfolio_returns)
        
        # Generate random returns
        random_returns = np.random.normal(
            mean_return,
            volatility,
            size=(self.num_simulations, self.time_horizon)
        )
        
        # Calculate cumulative returns
        cumulative_returns = np.cumprod(1 + random_returns, axis=1)
        simulated_values = initial_value * cumulative_returns
        
        # Calculate confidence intervals
        confidence_intervals = {}
        for conf_level in self.confidence_levels:
            lower_percentile = (1 - conf_level) / 2
            upper_percentile = 1 - lower_percentile
            
            lower_bound = np.percentile(simulated_values[:, -1], lower_percentile * 100)
            upper_bound = np.percentile(simulated_values[:, -1], upper_percentile * 100)
            
            confidence_intervals[f"{conf_level:.0%}"] = (lower_bound, upper_bound)
        
        # Calculate Value at Risk
        var_values = {}
        for conf_level in self.confidence_levels:
            var_values[f"{conf_level:.0%}"] = self._calculate_var(
                simulated_values[:, -1],
                initial_value,
                conf_level
            )
        
        return MonteCarloResult(
            simulated_returns=simulated_values,
            confidence_intervals=confidence_intervals,
            value_at_risk=var_values,
            expected_return=float(np.mean(simulated_values[:, -1])),
            volatility=float(np.std(simulated_values[:, -1]))
        )
    
    def _calculate_var(
        self,
        final_values: np.ndarray,
        initial_value: float,
        confidence_level: float
    ) -> float:
        """Calculate Value at Risk from simulation results"""
        losses = initial_value - final_values
        return float(np.percentile(losses, confidence_level * 100))
    
    def get_summary_statistics(self, result: MonteCarloResult) -> Dict[str, float]:
        """Generate summary statistics from simulation results"""
        final_values = result.simulated_returns[:, -1]
        
        return {
            "mean": float(np.mean(final_values)),
            "median": float(np.median(final_values)),
            "std": float(np.std(final_values)),
            "skew": float(self._calculate_skewness(final_values)),
            "kurtosis": float(self._calculate_kurtosis(final_values)),
            "min": float(np.min(final_values)),
            "max": float(np.max(final_values))
        }
    
    def _calculate_skewness(self, values: np.ndarray) -> float:
        """Calculate skewness of distribution"""
        n = len(values)
        mean = np.mean(values)
        std = np.std(values)
        return (np.sum((values - mean) ** 3) / n) / (std ** 3)
    
    def _calculate_kurtosis(self, values: np.ndarray) -> float:
        """Calculate kurtosis of distribution"""
        n = len(values)
        mean = np.mean(values)
        std = np.std(values)
        return (np.sum((values - mean) ** 4) / n) / (std ** 4)