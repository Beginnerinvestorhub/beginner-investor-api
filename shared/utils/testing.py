from typing import Any, Dict, List, Optional
import random
import string
from datetime import datetime, timedelta
from decimal import Decimal
from ..types import (
    UserCreate,
    PortfolioCreate,
    Position,
    AssetClass,
    RiskLevel
)

class MockDataGenerator:
    """Generate mock data for testing"""
    
    @staticmethod
    def random_email() -> str:
        """Generate random email"""
        username = ''.join(random.choices(string.ascii_lowercase, k=10))
        domain = random.choice(['gmail.com', 'yahoo.com', 'test.com'])
        return f"{username}@{domain}"
    
    @staticmethod
    def random_username() -> str:
        """Generate random username"""
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
    
    @staticmethod
    def random_password() -> str:
        """Generate valid random password"""
        chars = string.ascii_letters + string.digits + "!@#$%"
        password = [
            random.choice(string.ascii_uppercase),
            random.choice(string.ascii_lowercase),
            random.choice(string.digits),
            random.choice("!@#$%")
        ]
        password.extend(random.choices(chars, k=8))
        random.shuffle(password)
        return ''.join(password)
    
    @staticmethod
    def random_symbol() -> str:
        """Generate random stock symbol"""
        return ''.join(random.choices(string.ascii_uppercase, k=random.randint(2, 5)))
    
    @staticmethod
    def random_decimal(min_val: float = 0, max_val: float = 1000) -> Decimal:
        """Generate random decimal"""
        return Decimal(str(round(random.uniform(min_val, max_val), 2)))
    
    @staticmethod
    def random_date(start_days_ago: int = 365, end_days_ago: int = 0) -> datetime:
        """Generate random date"""
        start = datetime.now() - timedelta(days=start_days_ago)
        end = datetime.now() - timedelta(days=end_days_ago)
        delta = end - start
        random_days = random.randint(0, delta.days)
        return start + timedelta(days=random_days)
    
    @staticmethod
    def create_mock_user(**overrides) -> Dict[str, Any]:
        """Create mock user data"""
        data = {
            "email": MockDataGenerator.random_email(),
            "username": MockDataGenerator.random_username(),
            "password": MockDataGenerator.random_password(),
            "first_name": random.choice(["John", "Jane", "Bob", "Alice"]),
            "last_name": random.choice(["Smith", "Doe", "Johnson", "Williams"])
        }
        data.update(overrides)
        return data
    
    @staticmethod
    def create_mock_position(**overrides) -> Dict[str, Any]:
        """Create mock position data"""
        data = {
            "symbol": MockDataGenerator.random_symbol(),
            "quantity": MockDataGenerator.random_decimal(1, 100),
            "cost_basis": MockDataGenerator.random_decimal(10, 500),
            "asset_class": random.choice(list(AssetClass))
        }
        data.update(overrides)
        return data
    
    @staticmethod
    def create_mock_portfolio(**overrides) -> Dict[str, Any]:
        """Create mock portfolio data"""
        positions = [
            MockDataGenerator.create_mock_position()
            for _ in range(random.randint(3, 10))
        ]
        
        data = {
            "name": f"Portfolio {random.randint(1, 1000)}",
            "description": "Test portfolio",
            "risk_level": random.choice(list(RiskLevel)),
            "initial_value": MockDataGenerator.random_decimal(10000, 100000),
            "positions": positions
        }
        data.update(overrides)
        return data
    
    @staticmethod
    def create_mock_ohlcv_data(
        symbol: str,
        days: int = 30,
        start_price: float = 100.0
    ) -> List[Dict[str, Any]]:
        """Create mock OHLCV data"""
        data = []
        current_price = start_price
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days - i)
            
            # Random price movement
            change = random.uniform(-0.05, 0.05)
            current_price *= (1 + change)
            
            open_price = current_price * random.uniform(0.98, 1.02)
            high_price = max(open_price, current_price) * random.uniform(1.0, 1.03)
            low_price = min(open_price, current_price) * random.uniform(0.97, 1.0)
            close_price = current_price
            volume = random.randint(1000000, 10000000)
            
            data.append({
                "timestamp": date,
                "symbol": symbol,
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": volume
            })
        
        return data

class APITestClient:
    """Test client wrapper for FastAPI testing"""
    
    def __init__(self, client):
        self.client = client
        self.token = None
    
    def set_auth_token(self, token: str):
        """Set authentication token"""
        self.token = token
    
    def get_headers(self, **extra_headers) -> Dict[str, str]:
        """Get headers with auth token"""
        headers = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        headers.update(extra_headers)
        return headers
    
    async def get(self, url: str, **kwargs):
        """GET request with auth"""
        headers = self.get_headers(**kwargs.pop('headers', {}))
        return await self.client.get(url, headers=headers, **kwargs)
    
    async def post(self, url: str, **kwargs):
        """POST request with auth"""
        headers = self.get_headers(**kwargs.pop('headers', {}))
        return await self.client.post(url, headers=headers, **kwargs)
    
    async def put(self, url: str, **kwargs):
        """PUT request with auth"""
        headers = self.get_headers(**kwargs.pop('headers', {}))
        return await self.client.put(url, headers=headers, **kwargs)
    
    async def delete(self, url: str, **kwargs):
        """DELETE request with auth"""
        headers = self.get_headers(**kwargs.pop('headers', {}))
        return await self.client.delete(url, headers=headers, **kwargs)

def assert_valid_response(response, expected_status: int = 200):
    """Assert response is valid"""
    assert response.status_code == expected_status, \
        f"Expected {expected_status}, got {response.status_code}: {response.text}"

def assert_has_keys(data: Dict, keys: List[str]):
    """Assert dictionary has all keys"""
    for key in keys:
        assert key in data, f"Missing key: {key}"

def assert_valid_uuid(value: str):
    """Assert string is valid UUID"""
    import uuid
    try:
        uuid.UUID(value)
    except ValueError:
        raise AssertionError(f"Invalid UUID: {value}")
