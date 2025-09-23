"""Health check utilities for monitoring service status."""
from __future__ import annotations

import asyncio
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Awaitable, Callable, Dict, List, Optional, Union

import aiohttp
import redis.asyncio as redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import async_session_factory

@dataclass
class HealthCheckResult:
    """Result of a health check."""
    status: str  # 'ok', 'warning', 'error'
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def is_healthy(self) -> bool:
        """Check if the result indicates a healthy status."""
        return self.status == "ok"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to a dictionary."""
        return {
            "status": self.status,
            "details": self.details,
            "timestamp": self.timestamp.isoformat(),
        }

class HealthCheck:
    """Health check manager for running multiple health checks."""
    
    def __init__(self, service_name: str):
        """Initialize the health check manager."""
        self.service_name = service_name
        self.checks: Dict[str, Callable[..., Any]] = {}
        self.async_checks: Dict[str, Callable[..., Awaitable[Any]]] = {}
    
    def add_check(
        self,
        name: str,
        check_func: Callable[..., Any],
    ) -> None:
        """Add a synchronous health check."""
        self.checks[name] = check_func
    
    def add_async_check(
        self,
        name: str,
        check_func: Callable[..., Awaitable[Any]],
    ) -> None:
        """Add an asynchronous health check."""
        self.async_checks[name] = check_func
    
    async def run_checks(
        self,
        timeout: float = 5.0,
    ) -> Dict[str, HealthCheckResult]:
        """Run all health checks and return the results."""
        results: Dict[str, HealthCheckResult] = {}
        
        # Run sync checks
        for name, check in self.checks.items():
            try:
                details = check() or {}
                results[name] = HealthCheckResult(
                    status="ok",
                    details=details if isinstance(details, dict) else {"result": details},
                )
            except Exception as e:
                results[name] = HealthCheckResult(
                    status="error",
                    details={
                        "error": str(e),
                        "type": type(e).__name__,
                    },
                )
        
        # Run async checks in parallel
        if self.async_checks:
            async def run_async_check(name: str, check: Callable) -> tuple[str, HealthCheckResult]:
                try:
                    result = await asyncio.wait_for(check(), timeout=timeout)
                    return name, HealthCheckResult(
                        status="ok",
                        details=result if isinstance(result, dict) else {"result": result},
                    )
                except asyncio.TimeoutError:
                    return name, HealthCheckResult(
                        status="error",
                        details={"error": f"Check timed out after {timeout} seconds"},
                    )
                except Exception as e:
                    return name, HealthCheckResult(
                        status="error",
                        details={
                            "error": str(e),
                            "type": type(e).__name__,
                        },
                    )
            
            # Run all async checks concurrently
            async_tasks = [
                run_async_check(name, check)
                for name, check in self.async_checks.items()
            ]
            
            if async_tasks:
                completed = await asyncio.gather(*async_tasks, return_exceptions=False)
                results.update(dict(completed))
        
        return results

# Common health check functions

async def async_check_database() -> Dict[str, Any]:
    """Check if the database is accessible."""
    if not settings.DATABASE_URI:
        return {"status": "disabled"}
    
    async with async_session_factory() as session:
        try:
            start_time = datetime.utcnow()
            result = await session.execute(text("SELECT 1"))
            latency = (datetime.utcnow() - start_time).total_seconds()
            
            return {
                "status": "ok",
                "latency_seconds": round(latency, 4),
                "database": settings.POSTGRES_DB,
                "server": settings.POSTGRES_SERVER,
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "type": type(e).__name__,
            }

async def async_check_redis() -> Dict[str, Any]:
    """Check if Redis is accessible."""
    if not settings.REDIS_URL:
        return {"status": "disabled"}
    
    try:
        redis_client = redis.from_url(settings.REDIS_URL)
        start_time = datetime.utcnow()
        pong = await redis_client.ping()
        latency = (datetime.utcnow() - start_time).total_seconds()
        
        return {
            "status": "ok" if pong else "error",
            "latency_seconds": round(latency, 4),
            "redis_url": settings.REDIS_URL,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
        }
    finally:
        if 'redis_client' in locals():
            await redis_client.close()

async def async_check_storage() -> Dict[str, Any]:
    """Check if storage is accessible."""
    try:
        # Check if we can write to the filesystem
        test_file = os.path.join(settings.BASE_DIR, "health_check.tmp")
        test_content = f"Health check at {datetime.utcnow().isoformat()}"
        
        # Test write
        start_time = datetime.utcnow()
        
        async with aiofiles.open(test_file, "w") as f:
            await f.write(test_content)
        
        # Test read
        async with aiofiles.open(test_file, "r") as f:
            content = await f.read()
        
        latency = (datetime.utcnow() - start_time).total_seconds()
        
        # Clean up
        try:
            os.remove(test_file)
        except Exception:
            pass
        
        return {
            "status": "ok" if content == test_content else "error",
            "latency_seconds": round(latency, 4),
            "storage_type": "filesystem",
            "path": str(settings.BASE_DIR),
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
        }

async def async_check_external_service(url: str, timeout: float = 5.0) -> Dict[str, Any]:
    """Check if an external service is accessible."""
    try:
        async with aiohttp.ClientSession() as session:
            start_time = datetime.utcnow()
            
            async with session.get(url, timeout=timeout) as response:
                latency = (datetime.utcnow() - start_time).total_seconds()
                
                return {
                    "status": "ok" if response.status < 400 else "error",
                    "status_code": response.status,
                    "latency_seconds": round(latency, 4),
                    "url": url,
                }
    except asyncio.TimeoutError:
        return {
            "status": "error",
            "error": f"Request to {url} timed out after {timeout} seconds",
            "type": "TimeoutError",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
        }

# Helper functions for common checks

def check_disk_usage(path: str = "/", min_percent: float = 10.0) -> Dict[str, Any]:
    """Check disk usage for a given path."""
    try:
        import shutil
        
        total, used, free = shutil.disk_usage(path)
        percent_used = (used / total) * 100
        
        return {
            "status": "ok" if percent_used < (100 - min_percent) else "warning",
            "path": path,
            "total_gb": round(total / (1024 ** 3), 2),
            "used_gb": round(used / (1024 ** 3), 2),
            "free_gb": round(free / (1024 ** 3), 2),
            "percent_used": round(percent_used, 2),
            "min_free_percent": min_percent,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
        }

def check_memory_usage(warning_threshold: float = 90.0) -> Dict[str, Any]:
    """Check system memory usage."""
    try:
        import psutil
        
        mem = psutil.virtual_memory()
        percent_used = mem.percent
        
        return {
            "status": "ok" if percent_used < warning_threshold else "warning",
            "total_gb": round(mem.total / (1024 ** 3), 2),
            "available_gb": round(mem.available / (1024 ** 3), 2),
            "used_gb": round(mem.used / (1024 ** 3), 2),
            "percent_used": round(percent_used, 2),
            "warning_threshold": warning_threshold,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
        }

def check_cpu_usage(warning_threshold: float = 90.0) -> Dict[str, Any]:
    """Check CPU usage."""
    try:
        import psutil
        
        percent_used = psutil.cpu_percent(interval=1)
        
        return {
            "status": "ok" if percent_used < warning_threshold else "warning",
            "cpu_percent": round(percent_used, 2),
            "cpu_count": psutil.cpu_count(),
            "warning_threshold": warning_threshold,
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "type": type(e).__name__,
        }
