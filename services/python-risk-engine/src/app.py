from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Python Risk Engine",
    description="Service for calculating and managing investment risk metrics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import after environment setup
from .services.risk_calculator import RiskCalculator
from .algorithms.var_calculator import VarCalculator
from .algorithms.monte_carlo import MonteCarloSimulation
import numpy as np

# Initialize services
risk_calculator = RiskCalculator()
var_calculator = VarCalculator()
mc_simulator = MonteCarloSimulation()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {
        "status": "healthy",
        "service": "risk-engine",
        "version": "1.0.0"
    }

# Example risk calculation endpoint
@app.post("/calculate-risk")
async def calculate_risk(portfolio_data: Dict[str, Any]):
    """Calculate risk metrics for a given portfolio."""
    try:
        # Extract portfolio data
        portfolio_id = portfolio_data.get("portfolio_id", "default")
        returns_data = portfolio_data.get("returns", [])
        weights_data = portfolio_data.get("weights", [])

        if not returns_data or not weights_data:
            raise HTTPException(status_code=400, detail="Returns and weights are required")

        # Convert to numpy arrays
        returns = np.array(returns_data)
        weights = np.array(weights_data)

        # Validate inputs
        if len(returns) == 0 or len(weights) == 0:
            raise HTTPException(status_code=400, detail="Empty returns or weights")

        # Calculate risk metrics using our service
        risk_metrics = risk_calculator.calculate_portfolio_risk(
            portfolio_id=portfolio_id,
            returns=returns.reshape(-1, 1),
            weights=weights
        )

        # Calculate VaR using different methods
        var_results = var_calculator.calculate_var(
            returns=returns.reshape(-1, 1),
            weights=weights,
            method="all",
            portfolio_value=portfolio_data.get("portfolio_value", 10000.0)
        )

        # Run Monte Carlo simulation if requested
        monte_carlo_result = None
        if portfolio_data.get("include_monte_carlo", False):
            monte_carlo_result = mc_simulator.run_simulation(
                returns=returns,
                weights=weights,
                initial_value=portfolio_data.get("portfolio_value", 10000.0)
            )

        # Format response
        response = {
            "status": "success",
            "portfolio_id": portfolio_id,
            "risk_metrics": {
                "volatility": risk_metrics.volatility,
                "var_95": risk_metrics.var_95,
                "var_99": risk_metrics.var_99,
                "sharpe_ratio": risk_metrics.sharpe_ratio,
                "sortino_ratio": risk_metrics.sortino_ratio,
                "max_drawdown": risk_metrics.max_drawdown,
                "beta": risk_metrics.beta,
                "correlation_matrix": risk_metrics.correlation_matrix
            },
            "var_analysis": {
                method: {
                    "var_historical": result.var_historical,
                    "var_parametric": result.var_parametric,
                    "var_conditional": result.var_conditional,
                    "confidence_level": result.confidence_level,
                    "time_horizon": result.time_horizon
                }
                for method, result in var_results.items()
            }
        }

        # Add Monte Carlo results if requested
        if monte_carlo_result:
            response["monte_carlo"] = {
                "expected_return": monte_carlo_result.expected_return,
                "volatility": monte_carlo_result.volatility,
                "confidence_intervals": monte_carlo_result.confidence_intervals,
                "value_at_risk": monte_carlo_result.value_at_risk
            }

        return response

    except Exception as e:
        logger.error(f"Error calculating risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Portfolio stress testing endpoint
@app.post("/stress-test")
async def stress_test_portfolio(portfolio_data: Dict[str, Any]):
    """Perform stress testing on a portfolio under different scenarios."""
    try:
        # Extract portfolio data
        portfolio_id = portfolio_data.get("portfolio_id", "default")
        returns_data = portfolio_data.get("returns", [])
        weights_data = portfolio_data.get("weights", [])
        scenarios = portfolio_data.get("scenarios", {})

        if not returns_data or not weights_data or not scenarios:
            raise HTTPException(status_code=400, detail="Returns, weights, and scenarios are required")

        # Convert to numpy arrays
        returns = np.array(returns_data)
        weights = np.array(weights_data)

        # Perform stress testing
        stress_results = var_calculator.stress_test(
            returns=returns.reshape(-1, 1),
            weights=weights,
            scenarios=scenarios,
            portfolio_value=portfolio_data.get("portfolio_value", 10000.0)
        )

        return {
            "status": "success",
            "portfolio_id": portfolio_id,
            "stress_test_results": stress_results
        }

    except Exception as e:
        logger.error(f"Error in stress testing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk profile assessment endpoint
@app.post("/assess-risk-profile")
async def assess_risk_profile(user_data: Dict[str, Any]):
    """Assess user's risk profile based on their preferences and history."""
    try:
        # Extract user data
        user_id = user_data.get("user_id", "default")
        risk_tolerance = user_data.get("risk_tolerance", 5)  # 1-10 scale
        investment_horizon = user_data.get("investment_horizon", 12)  # months
        loss_tolerance = user_data.get("loss_tolerance", 0.15)  # 15% max drawdown
        preferred_assets = user_data.get("preferred_asset_classes", ["stocks", "bonds"])

        # Create risk profile response
        profile = {
            "user_id": user_id,
            "risk_tolerance": risk_tolerance,
            "investment_horizon": investment_horizon,
            "loss_tolerance": loss_tolerance,
            "preferred_asset_classes": preferred_assets,
            "recommended_allocation": {
                "conservative": {"stocks": 0.3, "bonds": 0.6, "cash": 0.1},
                "moderate": {"stocks": 0.5, "bonds": 0.4, "cash": 0.1},
                "aggressive": {"stocks": 0.7, "bonds": 0.2, "cash": 0.1}
            }.get("moderate" if risk_tolerance <= 4 else "aggressive" if risk_tolerance >= 7 else "moderate"),
            "risk_warnings": []
        }

        # Add risk warnings based on profile
        if risk_tolerance >= 8:
            profile["risk_warnings"].append("High risk tolerance may lead to significant losses in market downturns")
        if investment_horizon < 12:
            profile["risk_warnings"].append("Short investment horizon may not allow sufficient time for recovery from market volatility")

        return {
            "status": "success",
            "risk_profile": profile
        }

    except Exception as e:
        logger.error(f"Error assessing risk profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
