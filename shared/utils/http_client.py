import httpx
from typing import Optional, Dict, Any
import asyncio
from functools import wraps
import time

class HTTPClient:
    """Async HTTP client wrapper with retries and timeouts"""
    
    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        headers: Optional[Dict[str, str]] = None
    ):
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.default_headers = headers or {}
        self.client = None
    
    async def __aenter__(self):
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers=self.default_headers
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            await self.client.aclose()
    
    async def request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> httpx.Response:
        """Make HTTP request with retries"""
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                response = await self.client.request(method, url, **kwargs)
                response.raise_for_status()
                return response
            except httpx.HTTPError as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    await asyncio.sleep(wait_time)
                else:
                    raise last_exception
        
        raise last_exception
    
    async def get(self, url: str, **kwargs) -> httpx.Response:
        """GET request"""
        return await self.request("GET", url, **kwargs)
    
    async def post(self, url: str, **kwargs) -> httpx.Response:
        """POST request"""
        return await self.request("POST", url, **kwargs)
    
    async def put(self, url: str, **kwargs) -> httpx.Response:
        """PUT request"""
        return await self.request("PUT", url, **kwargs)
    
    async def delete(self, url: str, **kwargs) -> httpx.Response:
        """DELETE request"""
        return await self.request("DELETE", url, **kwargs)
    
    async def patch(self, url: str, **kwargs) -> httpx.Response:
        """PATCH request"""
        return await self.request("PATCH", url, **kwargs)

async def fetch_json(url: str, **kwargs) -> Dict[str, Any]:
    """Quick utility to fetch JSON from URL"""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, **kwargs)
        response.raise_for_status()
        return response.json()

def rate_limited(calls: int, period: float):
    """Rate limit decorator for async functions"""
    min_interval = period / calls
    last_called = [0.0]
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)
            
            last_called[0] = time.time()
            return await func(*args, **kwargs)
        return wrapper
    return decorator.
