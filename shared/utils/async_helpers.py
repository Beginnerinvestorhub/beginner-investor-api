import asyncio
from typing import Callable, Any, List, TypeVar, Coroutine
from functools import wraps
import time

T = TypeVar('T')

async def run_concurrent(tasks: List[Coroutine], max_concurrent: int = 10) -> List[Any]:
    """Run tasks concurrently with limit"""
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def bounded_task(task):
        async with semaphore:
            return await task
    
    return await asyncio.gather(*[bounded_task(task) for task in tasks])

async def retry_async(
    func: Callable,
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,)
) -> Any:
    """Retry async function with exponential backoff"""
    for attempt in range(max_attempts):
        try:
            return await func()
        except exceptions as e:
            if attempt == max_attempts - 1:
                raise
            
            wait_time = delay * (backoff ** attempt)
            await asyncio.sleep(wait_time)

def async_timeout(seconds: float):
    """Decorator to add timeout to async function"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
        return wrapper
    return decorator

async def debounce_async(func: Callable, delay: float):
    """Debounce async function"""
    task = None
    
    async def debounced(*args, **kwargs):
        nonlocal task
        
        if task:
            task.cancel()
        
        async def delayed_func():
            await asyncio.sleep(delay)
            return await func(*args, **kwargs)
        
        task = asyncio.create_task(delayed_func())
        return await task
    
    return debounced

async def throttle_async(func: Callable, rate: float):
    """Throttle async function to max rate per second"""
    min_interval = 1.0 / rate
    last_called = 0.0
    
    async def throttled(*args, **kwargs):
        nonlocal last_called
        
        elapsed = time.time() - last_called
        if elapsed < min_interval:
            await asyncio.sleep(min_interval - elapsed)
        
        last_called = time.time()
        return await func(*args, **kwargs)
    
    return throttled
