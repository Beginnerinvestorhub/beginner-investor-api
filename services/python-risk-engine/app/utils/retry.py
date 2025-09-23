"""Retry utilities with exponential backoff and jitter."""
import asyncio
import functools
import logging
import random
import time
from typing import (
    Any,
    Awaitable,
    Callable,
    Optional,
    Type,
    TypeVar,
    Union,
    cast,
)

from app.utils.circuit_breaker import circuit

T = TypeVar('T')
P = TypeVar('P')
R = TypeVar('R')

class MaxRetriesExceededError(Exception):
    """Raised when the maximum number of retries is exceeded."""
    def __init__(self, message: str, last_exception: Optional[Exception] = None):
        self.last_exception = last_exception
        super().__init__(message)

def retry(
    max_attempts: int = 3,
    initial_delay: float = 0.1,
    max_delay: float = 30.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retry_on: Union[Type[Exception], tuple[Type[Exception], ...]] = Exception,
    on_retry: Optional[Callable[[int, float, Exception], None]] = None,
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """Decorator that retries a function with exponential backoff.
    
    Args:
        max_attempts: Maximum number of attempts (including the first try)
        initial_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries in seconds
        exponential_base: Base for exponential backoff
        jitter: Whether to add random jitter to delays
        retry_on: Exception type(s) to retry on
        on_retry: Optional callback called before each retry with
                  (attempt, delay, last_exception) arguments
                  
    Returns:
        Decorated function that will retry on failure
    """
    if max_attempts < 1:
        raise ValueError("max_attempts must be >= 1")
    
    def decorator(func: Callable[P, R]) -> Callable[P, R]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            last_exception: Optional[Exception] = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except retry_on as e:
                    last_exception = e
                    
                    # Don't retry on the last attempt
                    if attempt == max_attempts:
                        break
                    
                    # Calculate delay with exponential backoff and jitter
                    delay = min(
                        initial_delay * (exponential_base ** (attempt - 1)),
                        max_delay
                    )
                    
                    if jitter:
                        # Add up to 25% jitter
                        delay = delay * (0.75 + 0.5 * random.random())
                    
                    # Call the on_retry callback if provided
                    if on_retry:
                        try:
                            on_retry(attempt, delay, last_exception)
                        except Exception as e:
                            logging.warning("Error in on_retry callback: %s", e)
                    
                    # Sleep before retrying
                    time.sleep(delay)
            
            # If we get here, all attempts failed
            raise MaxRetriesExceededError(
                f"Function {func.__name__} failed after {max_attempts} attempts",
                last_exception
            )
        
        return wrapper
    
    return decorator

def async_retry(
    max_attempts: int = 3,
    initial_delay: float = 0.1,
    max_delay: float = 30.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retry_on: Union[Type[Exception], tuple[Type[Exception], ...]] = Exception,
    on_retry: Optional[Callable[[int, float, Exception], Awaitable[None]]] = None,
) -> Callable[[Callable[P, Awaitable[R]]], Callable[P, Awaitable[R]]]:
    """Async version of the retry decorator.
    
    Args:
        max_attempts: Maximum number of attempts (including the first try)
        initial_delay: Initial delay between retries in seconds
        max_delay: Maximum delay between retries in seconds
        exponential_base: Base for exponential backoff
        jitter: Whether to add random jitter to delays
        retry_on: Exception type(s) to retry on
        on_retry: Optional async callback called before each retry with
                 (attempt, delay, last_exception) arguments
                  
    Returns:
        Decorated async function that will retry on failure
    """
    if max_attempts < 1:
        raise ValueError("max_attempts must be >= 1")
    
    def decorator(func: Callable[P, Awaitable[R]]) -> Callable[P, Awaitable[R]]:
        @functools.wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            last_exception: Optional[Exception] = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except retry_on as e:
                    last_exception = e
                    
                    # Don't retry on the last attempt
                    if attempt == max_attempts:
                        break
                    
                    # Calculate delay with exponential backoff and jitter
                    delay = min(
                        initial_delay * (exponential_base ** (attempt - 1)),
                        max_delay
                    )
                    
                    if jitter:
                        # Add up to 25% jitter
                        delay = delay * (0.75 + 0.5 * random.random())
                    
                    # Call the on_retry callback if provided
                    if on_retry:
                        try:
                            await on_retry(attempt, delay, last_exception)
                        except Exception as e:
                            logging.warning("Error in on_retry callback: %s", e)
                    
                    # Sleep before retrying
                    await asyncio.sleep(delay)
            
            # If we get here, all attempts failed
            raise MaxRetriesExceededError(
                f"Function {func.__name__} failed after {max_attempts} attempts",
                last_exception
            )
        
        return wrapper
    
    return decorator

def with_retry(
    func: Callable[P, R],
    max_attempts: int = 3,
    initial_delay: float = 0.1,
    max_delay: float = 30.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    retry_on: Union[Type[Exception], tuple[Type[Exception], ...]] = Exception,
) -> Callable[P, R]:
    ""
    Apply retry logic to a function.
    
    This is a non-decorator version of the retry functionality.
    
    Example:
        def my_function():
            # Might fail
            return result
            
        # Use with retry
        result = with_retry(my_function, max_attempts=5)()
    """
    return retry(
        max_attempts=max_attempts,
        initial_delay=initial_delay,
        max_delay=max_delay,
        exponential_base=exponential_base,
        jitter=jitter,
        retry_on=retry_on,
    )(func)

# Default circuit breaker for external API calls
EXTERNAL_API_CIRCUIT = circuit(
    "external_api",
    failure_threshold=5,
    recovery_timeout=60.0,
    expected_exceptions=(Exception,),
)

# Default retry decorator for external API calls
def with_api_retry(
    max_attempts: int = 3,
    initial_delay: float = 0.5,
    max_delay: float = 30.0,
):
    """
    Decorator that combines retry logic with circuit breaking for external API calls.
    
    This is the recommended way to make external API calls that might be flaky.
    
    Example:
        @with_api_retry(max_attempts=5)
        def call_external_api():
            # Call external API
            return response
    """
    def decorator(func):
        # Apply circuit breaker first, then retry
        return EXTERNAL_API_CIRCUIT(
            retry(
                max_attempts=max_attempts,
                initial_delay=initial_delay,
                max_delay=max_delay,
                exponential_base=2.0,
                jitter=True,
                retry_on=(Exception,),
            )(func)
        )
    return decorator
