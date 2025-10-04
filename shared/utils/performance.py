import time
import asyncio
from functools import wraps
from typing import Callable, Any
from contextlib import contextmanager
import psutil
import os

class Timer:
    """Context manager for timing code blocks"""
    
    def __init__(self, name: str = "Operation"):
        self.name = name
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, *args):
        self.end_time = time.perf_counter()
        self.elapsed = self.end_time - self.start_time
        print(f"{self.name} took {self.elapsed:.4f} seconds")
    
    @property
    def elapsed_ms(self) -> float:
        """Get elapsed time in milliseconds"""
        return self.elapsed * 1000 if self.elapsed else 0

def timeit(func: Callable) -> Callable:
    """Decorator to time function execution"""
    @wraps(func)
    async def async_wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} took {elapsed:.4f}s")
        return result
    
    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper

class MemoryProfiler:
    """Simple memory profiler"""
    
    def __init__(self):
        self.process = psutil.Process(os.getpid())
        self.start_memory = None
    
    def start(self):
        """Start profiling"""
        self.start_memory = self.process.memory_info().rss / 1024 / 1024  # MB
    
    def stop(self) -> float:
        """Stop profiling and return memory delta"""
        current_memory = self.process.memory_info().rss / 1024 / 1024
        return current_memory - self.start_memory if self.start_memory else 0
    
    @contextmanager
    def profile(self):
        """Context manager for memory profiling"""
        self.start()
        yield
        delta = self.stop()
        print(f"Memory usage delta: {delta:.2f} MB")

def memory_usage() -> Dict[str, float]:
    """Get current memory usage"""
    process = psutil.Process(os.getpid())
    mem_info = process.memory_info()
    
    return {
        "rss_mb": mem_info.rss / 1024 / 1024,
        "vms_mb": mem_info.vms / 1024 / 1024,
        "percent": process.memory_percent()
    }

class RateLimiter:
    """Simple rate limiter"""
    
    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self.calls = []
    
    async def acquire(self):
        """Acquire rate limit slot"""
        now = time.time()
        
        # Remove old calls
        self.calls = [t for t in self.calls if now - t < self.period]
        
        if len(self.calls) >= self.max_calls:
            # Wait until oldest call expires
            sleep_time = self.period - (now - self.calls[0])
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
            self.calls.pop(0)
        
        self.calls.append(now)
    
    def __call__(self, func: Callable) -> Callable:
        """Decorator to rate limit function"""
        @wraps(func)
        async def wrapper(*args, **kwargs):
            await self.acquire()
            return await func(*args, **kwargs)
        return wrapper
