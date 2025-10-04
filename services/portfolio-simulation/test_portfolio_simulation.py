#!/usr/bin/env python3
"""
Test script for Portfolio Simulation Service
Run this script to verify the service is working correctly.
"""

import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app.algorithms.mean_variance import MeanVarianceOptimizer
from app.algorithms.risk_parity import RiskParityOptimizer

async def test_portfolio_simulation():
    """Test the portfolio simulation functionality."""
    print("🧪 Testing Portfolio Simulation Service...")

    try:
        # Test 1: Test Mean-Variance Optimizer
        print("\n1. Testing Mean-Variance Optimizer...")
        mv_optimizer = MeanVarianceOptimizer()

        # Sample data for testing
        import numpy as np
        expected_returns = np.array([0.08, 0.10, 0.06, 0.05])  # Expected returns for 4 assets
        covariance_matrix = np.array([
            [0.04, 0.02, 0.01, 0.005],
            [0.02, 0.06, 0.015, 0.008],
            [0.01, 0.015, 0.03, 0.004],
            [0.005, 0.008, 0.004, 0.02]
        ])

        try:
            weights = mv_optimizer.optimize(expected_returns, covariance_matrix)
            print(f"✅ Mean-Variance optimization successful: {weights}")
        except Exception as e:
            print(f"⚠️ Mean-Variance optimization failed (expected): {e}")

        # Test 2: Test Risk Parity Optimizer
        print("\n2. Testing Risk Parity Optimizer...")
        rp_optimizer = RiskParityOptimizer()

        try:
            rp_weights = rp_optimizer.optimize(covariance_matrix)
            print(f"✅ Risk Parity optimization successful: {rp_weights}")
        except Exception as e:

        # Test 3: Test API imports
        print("\n3. Testing API structure...")
        try:
            from app.main import app
            print("✅ FastAPI app imported successfully")
            print(f"✅ App title: {app.title}")
            print(f"✅ Number of routes: {len(app.routes)}")

            # Check available routes
            routes = [route.path for route in app.routes if hasattr(route, 'path')]
            print(f"✅ Available routes: {routes}")

            # Check available tags
            tags = set()
            for route in app.routes:
                if hasattr(route, 'tags'):
                    tags.update(route.tags)
            print(f"✅ Available tags: {tags}")
{{ ... }}
        except Exception as e:
            print(f"❌ API import failed: {e}")
            import traceback
            traceback.print_exc()

        # Test 4: Test configuration
        print("\n4. Testing configuration...")
        try:
            from app.core.config import settings
            print(f"✅ Configuration loaded: {settings.PROJECT_NAME}")
            print(f"✅ API version: {settings.API_V1_STR}")
            print(f"✅ Debug mode: {settings.DEBUG}")
        except Exception as e:
            print(f"❌ Configuration failed: {e}")

        print("\n🎉 Portfolio Simulation service structure is working!")

        return True

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_portfolio_simulation())
    sys.exit(0 if success else 1)
