import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class VaRResult:
    var_historical: float
    var_parametric: float
    var_conditional: float
    confidence_level: float
    time_horizon: int
    method: str

class VarCalculator:
    """Value at Risk (VaR) calculator with multiple methodologies"""
    
    def __init__(
        self,
        confidence_level: float = 0.95,
        time_horizon: int = 1,
        lookback_period: int = 252
    ):
        self.confidence_level = confidence_level
        self.time_horizon = time_horizon
        self.lookback_period = lookback_period
        
    def calculate_var(
        self,
        returns: np.ndarray,
        weights: np.ndarray,
        method: str = "all",
        portfolio_value: float = 10000.0
    ) -> Dict[str, VaRResult]:
        """
        Calculate Value at Risk using specified method(s)
        
        Methods:
        - historical: Historical simulation
        - parametric: Parametric (variance-covariance)
        - monte_carlo: Monte Carlo simulation
        - all: All methods
        """
        
        portfolio_returns = np.dot(returns, weights)
        results = {}
        
        if method in ["historical", "all"]:
            historical_var = self._historical_var(portfolio_returns, portfolio_value)
            results["historical"] = VaRResult(
                var_historical=historical_var,
                var_parametric=0.0,
                var_conditional=self._calculate_cvar(portfolio_returns, historical_var),
                confidence_level=self.confidence_level,
                time_horizon=self.time_horizon,
                method="historical"
            )
            
        if method in ["parametric", "all"]:
            parametric_var = self._parametric_var(portfolio_returns, portfolio_value)
            results["parametric"] = VaRResult(
                var_historical=0.0,
                var_parametric=parametric_var,
                var_conditional=self._calculate_cvar(portfolio_returns, parametric_var),
                confidence_level=self.confidence_level,
                time_horizon=self.time_horizon,
                method="parametric"
            )
            
        if method in ["monte_carlo", "all"]:
            mc_var = self._monte_carlo_var(portfolio_returns, portfolio_value)
            results["monte_carlo"] = VaRResult(
                var_historical=0.0,
                var_parametric=0.0,
                var_conditional=self._calculate_cvar(portfolio_returns, mc_var),
                confidence_level=self.confidence_level,
                time_horizon=self.time_horizon,
                method="monte_carlo"
            )
            
        return results
    
    def _historical_var(self, returns: np.ndarray, portfolio_value: float) -> float:
        """Calculate VaR using historical simulation"""
        sorted_returns = np.sort(returns)
        index = int((1 - self.confidence_level) * len(sorted_returns))
        return -portfolio_value * sorted_returns[index] * np.sqrt(self.time_horizon)
    
    def _parametric_var(self, returns: np.ndarray, portfolio_value: float) -> float:
        """Calculate VaR using parametric method"""
        mean = np.mean(returns)
        std = np.std(returns)
        z_score = np.abs(np.percentile(np.random.standard_normal(10000), 
                                     (1 - self.confidence_level) * 100))
        
        return portfolio_value * (-(mean * self.time_horizon) + 
                                (z_score * std * np.sqrt(self.time_horizon)))
    
    def _monte_carlo_var(
        self,
        returns: np.ndarray,
        portfolio_value: float,
        num_simulations: int = 10000
    ) -> float:
        """Calculate VaR using Monte Carlo simulation"""
        mean = np.mean(returns)
        std = np.std(returns)
        
        # Generate random scenarios
        random_returns = np.random.normal(
            mean * self.time_horizon,
            std * np.sqrt(self.time_horizon),
            num_simulations
        )
        
        # Calculate portfolio values
        portfolio_values = portfolio_value * (1 + random_returns)
        losses = portfolio_value - portfolio_values
        
        # Calculate VaR
        return np.percentile(losses, self.confidence_level * 100)
    
    def _calculate_cvar(self, returns: np.ndarray, var_value: float) -> float:
        """Calculate Conditional VaR (Expected Shortfall)"""
        losses = -returns
        var_index = losses >= var_value
        
        if not np.any(var_index):
            return var_value
            
        return np.mean(losses[var_index])
    
    def stress_test(
        self,
        returns: np.ndarray,
        weights: np.ndarray,
        scenarios: Dict[str, float],
        portfolio_value: float = 10000.0
    ) -> Dict[str, float]:
        """
        Perform stress testing under different scenarios
        
        scenarios: Dictionary of scenario names and their shock values
        Example: {"market_crash": -0.20, "interest_rate_spike": 0.03}
        """
        results = {}
        portfolio_returns = np.dot(returns, weights)
        
        for scenario_name, shock in scenarios.items():
            # Apply shock to returns
            shocked_returns = portfolio_returns + shock
            
            # Calculate VaR under stress scenario
            var_result = self.calculate_var(
                shocked_returns.reshape(-1, 1),
                np.array([1.0]),
                method="parametric",
                portfolio_value=portfolio_value
            )
            
            results[scenario_name] = var_result["parametric"].var_parametric
            
        return results