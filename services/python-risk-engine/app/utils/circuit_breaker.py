"""Circuit breaker pattern implementation for resilient service calls."""
import time
from enum import Enum, auto
from typing import Any, Callable, Optional, TypeVar, cast
from functools import wraps
import logging

# Type variable for generic function typing
T = TypeVar('T')

class CircuitState(Enum):
    """Circuit breaker states."""
    CLOSED = auto()    # Normal operation, requests allowed
    OPEN = auto()      # Circuit is open, requests fail fast
    HALF_OPEN = auto() # Test if service has recovered

class CircuitBreakerError(Exception):
    """Raised when the circuit is open and requests are failing fast."""
    def __init__(self, circuit_name: str, state: CircuitState, retry_after: float = 0):
        self.circuit_name = circuit_name
        self.state = state
        self.retry_after = retry_after
        super().__init__(
            f"Circuit '{circuit_name}' is {state.name}. "
            f"Retry after {retry_after:.1f}s"
        )

class CircuitBreaker:
    ""
    Circuit breaker to detect failures and encapsulate the logic of preventing a
    service from constantly trying to execute a function that's likely to fail.
    """
    
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        expected_exceptions: tuple[type[Exception], ...] = (Exception,),
        logger: Optional[logging.Logger] = None,
    ):
        """Initialize the circuit breaker.
        
        Args:
            name: Name of the circuit breaker for identification
            failure_threshold: Number of failures before opening the circuit
            recovery_timeout: Time in seconds after which to attempt recovery
            expected_exceptions: Exceptions that should be counted as failures
            logger: Optional logger for circuit state changes
        """
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exceptions = expected_exceptions
        self.logger = logger or logging.getLogger(__name__)
        
        # Circuit state
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: Optional[float] = None
        self._opened_at: Optional[float] = None
    
    @property
    def state(self) -> CircuitState:
        """Get the current state of the circuit."""
        # Check if we should transition from OPEN to HALF_OPEN
        if (
            self._state == CircuitState.OPEN
            and self._opened_at is not None
            and (time.monotonic() - self._opened_at) >= self.recovery_timeout
        ):
            self._state = CircuitState.HALF_OPEN
            self.logger.warning(
                "Circuit '%s' is now HALF_OPEN, testing if service has recovered",
                self.name
            )
        
        return self._state
    
    def record_failure(self) -> None:
        """Record a failed operation."""
        self._failure_count += 1
        self._last_failure_time = time.monotonic()
        
        if self._failure_count >= self.failure_threshold and self._state != CircuitState.OPEN:
            self._state = CircuitState.OPEN
            self._opened_at = time.monotonic()
            self.logger.error(
                "Circuit '%s' is now OPEN after %d failures",
                self.name, self._failure_count
            )
    
    def record_success(self) -> None:
        """Record a successful operation."""
        # Reset failure count on success
        if self._failure_count > 0:
            self._failure_count = 0
            self._last_failure_time = None
        
        # If we were in HALF_OPEN, transition back to CLOSED
        if self._state == CircuitState.HALF_OPEN:
            self._state = CircuitState.CLOSED
            self._opened_at = None
            self.logger.info("Circuit '%s' is now CLOSED", self.name)
    
    def get_retry_after(self) -> float:
        """Get the time until the next retry is allowed."""
        if self._opened_at is None:
            return 0.0
        
        elapsed = time.monotonic() - self._opened_at
        return max(0.0, self.recovery_timeout - elapsed)
    
    def __call__(self, func: Callable[..., T]) -> Callable[..., T]:
        """Decorator to apply the circuit breaker to a function."""
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            # Check if circuit is open
            if self.state == CircuitState.OPEN:
                retry_after = self.get_retry_after()
                raise CircuitBreakerError(self.name, CircuitState.OPEN, retry_after)
            
            # Try to execute the function
            try:
                result = func(*args, **kwargs)
                self.record_success()
                return result
            except self.expected_exceptions as e:
                self.record_failure()
                
                # If we're in HALF_OPEN, re-raise the original exception
                if self._state == CircuitState.HALF_OPEN:
                    self._state = CircuitState.OPEN
                    self._opened_at = time.monotonic()
                    self.logger.error(
                        "Circuit '%s' failed in HALF_OPEN state, reopening circuit",
                        self.name
                    )
                
                # Re-raise the original exception
                raise
            except Exception as e:
                # Don't trip the circuit for unexpected exceptions
                self.logger.exception(
                    "Unexpected exception in circuit '%s'", self.name
                )
                raise
        
        return cast(Callable[..., T], wrapper)

# Global circuit breakers registry
_circuit_breakers: dict[str, CircuitBreaker] = {}

def get_circuit_breaker(
    name: str,
    **kwargs: Any,
) -> CircuitBreaker:
    """Get or create a circuit breaker with the given name."""
    if name not in _circuit_breakers:
        _circuit_breakers[name] = CircuitBreaker(name, **kwargs)
    return _circuit_breakers[name]

def circuit(
    name: str,
    failure_threshold: int = 5,
    recovery_timeout: float = 30.0,
    expected_exceptions: tuple[type[Exception], ...] = (Exception,),
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """Decorator to apply a circuit breaker to a function.
    
    Example:
        @circuit("external_api", failure_threshold=3, recovery_timeout=60.0)
        def call_external_api():
            # Function that might fail
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        cb = get_circuit_breaker(
            name=name,
            failure_threshold=failure_threshold,
            recovery_timeout=recovery_timeout,
            expected_exceptions=expected_exceptions,
        )
        return cb(func)
    return decorator
