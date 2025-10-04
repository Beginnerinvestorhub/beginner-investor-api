#!/usr/bin/env python3
"""
Test script for Python Risk Engine Service
Run this script to verify the service is working correctly.
"""

import asyncio
import sys
import os
import json
import numpy as np

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from algorithms.var_calculator import VarCalculator
from algorithms.monte_carlo import MonteCarloSimulation
from services.risk_calculator import RiskCalculator

async def test_risk_engine():
    """Test the risk engine functionality."""
    print("🧪 Testing Python Risk Engine Service...")

    try:
        # Test 1: Test VaR Calculator
        print("\n1. Testing VaR Calculator...")
        var_calc = VarCalculator()

        # Generate sample returns data
        np.random.seed(42)  # For reproducible results
        returns = np.random.normal(0.001, 0.02, 252)  # 1 year of daily returns
        weights = np.array([0.6, 0.3, 0.1])  # Portfolio weights

        # Test all VaR methods
        var_results = var_calc.calculate_var(
            returns=returns.reshape(-1, 1),
            weights=weights,
            method="all",
            portfolio_value=10000.0
        )

        print(f"✅ Historical VaR (95%): ${var_results['historical'].var_historical:.2f}")
        print(f"✅ Parametric VaR (95%): ${var_results['parametric'].var_parametric:.2f}")
        print(f"✅ Monte Carlo VaR (95%): ${var_results['monte_carlo'].var_conditional:.2f}")

        # Test 2: Test Monte Carlo Simulation
        print("\n2. Testing Monte Carlo Simulation...")
        mc_sim = MonteCarloSimulation(num_simulations=1000)  # Smaller for testing

        mc_result = mc_sim.run_simulation(
            returns=returns,
            weights=weights,
            initial_value=10000.0
        )

        print(f"✅ Expected return: ${mc_result.expected_return:.2f}")
        print(f"✅ Volatility: {mc_result.volatility:.2f}")
        print(f"✅ 95% Confidence interval: ${mc_result.confidence_intervals['95%'][0]:.2f} - ${mc_result.confidence_intervals['95%'][1]:.2f}")

        # Test 3: Test Risk Calculator Service
        print("\n3. Testing Risk Calculator Service...")
        risk_calc = RiskCalculator()

        risk_metrics = risk_calc.calculate_portfolio_risk(
            portfolio_id="test_portfolio",
            returns=returns.reshape(-1, 1),
            weights=weights
        )

        print(f"✅ Portfolio volatility: {risk_metrics.volatility:.4f}")
        print(f"✅ Sharpe ratio: {risk_metrics.sharpe_ratio:.4f}")
        print(f"✅ VaR 95%: ${risk_metrics.var_95:.2f}")
        print(f"✅ Max drawdown: {risk_metrics.max_drawdown:.4f}")

        # Test 4: Test stress testing
        print("\n4. Testing stress testing...")
        scenarios = {
            "market_crash": -0.25,
            "interest_rate_hike": 0.02,
            "normal_conditions": 0.0
        }

        stress_results = var_calc.stress_test(
            returns=returns.reshape(-1, 1),
            weights=weights,
            scenarios=scenarios,
            portfolio_value=10000.0
        )

        print("✅ Stress test results:")
        for scenario, var_value in stress_results.items():
            print(f"   {scenario}: ${var_value:.2f}")

        print("\n🎉 All risk engine tests passed!")

        # Show sample API request format
        print("\n📋 Sample API Request Format:")
        sample_request = {
            "portfolio_id": "user_portfolio_123",
            "returns": returns.tolist(),
            "weights": weights.tolist(),
            "portfolio_value": 10000.0,
            "include_monte_carlo": True
        }

        print(json.dumps(sample_request, indent=2))

        return True

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_risk_engine())
    sys.exit(0 if success else 1)
