"""
Service Integration Module
Handles communication with other microservices in the system.
"""
import os
import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class ServiceIntegrator:
    """Handles integration with other microservices"""

    def __init__(self):
        self.behavioral_nudge_url = os.getenv("BEHAVIORAL_NUDGE_ENGINE_URL", "http://localhost:8005")
        self.risk_engine_url = os.getenv("RISK_ENGINE_URL", "http://localhost:8003")
        self.market_data_url = os.getenv("MARKET_DATA_URL", "http://localhost:8001")

    async def create_behavioral_nudge(self, nudge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a nudge in the behavioral-nudge-engine service

        Args:
            nudge_data: Nudge creation data including user_id, type, content, etc.

        Returns:
            Response from behavioral-nudge-engine service
        """
        url = f"{self.behavioral_nudge_url}/api/v1/nudges/"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=nudge_data, timeout=30.0)

                if response.status_code == 201:
                    return response.json()
                else:
                    logger.error(f"Failed to create nudge: {response.status_code} - {response.text}")
                    return {"error": f"Failed to create nudge: {response.status_code}"}

        except httpx.TimeoutException:
            logger.error("Timeout while creating nudge")
            return {"error": "Timeout while creating nudge"}
        except Exception as e:
            logger.error(f"Error creating nudge: {str(e)}")
            return {"error": str(e)}

    async def get_user_nudges(self, user_id: str, limit: int = 10) -> Dict[str, Any]:
        """
        Get nudges for a user from behavioral-nudge-engine

        Args:
            user_id: User ID to get nudges for
            limit: Maximum number of nudges to return

        Returns:
            List of nudges for the user
        """
        url = f"{self.behavioral_nudge_url}/api/v1/nudges/?limit={limit}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=15.0)

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get nudges: {response.status_code}")
                    return {"error": f"Failed to get nudges: {response.status_code}"}

        except Exception as e:
            logger.error(f"Error getting nudges: {str(e)}")
            return {"error": str(e)}

    async def calculate_portfolio_risk(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate portfolio risk using the risk-engine service

        Args:
            portfolio_data: Portfolio data for risk calculation

        Returns:
            Risk calculation results
        """
        url = f"{self.risk_engine_url}/api/v1/calculate-risk"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=portfolio_data, timeout=30.0)

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to calculate risk: {response.status_code}")
                    return {"error": f"Failed to calculate risk: {response.status_code}"}

        except Exception as e:
            logger.error(f"Error calculating risk: {str(e)}")
            return {"error": str(e)}

    async def get_market_data(self, symbol: str) -> Dict[str, Any]:
        """
        Get market data from marketdata-ingestion service

        Args:
            symbol: Stock symbol to get data for

        Returns:
            Market data for the symbol
        """
        url = f"{self.market_data_url}/api/v1/quotes/{symbol}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=15.0)

                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get market data: {response.status_code}")
                    return {"error": f"Failed to get market data: {response.status_code}"}

        except Exception as e:
            logger.error(f"Error getting market data: {str(e)}")
            return {"error": str(e)}

# Global service integrator instance
service_integrator = ServiceIntegrator()
