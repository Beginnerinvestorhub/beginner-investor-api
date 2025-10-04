from fastapi import FastAPI
from .cors import add_cors_middleware
from .compression import add_compression_middleware
from .security import SecurityHeadersMiddleware
from .request_id import RequestIDMiddleware
from .logging import RequestLoggingMiddleware
from .timeout import TimeoutMiddleware
from .error_handler import ErrorHandlerMiddleware
from .auth import AuthenticationMiddleware

def setup_middleware(
    app: FastAPI,
    enable_auth: bool = False,
    enable_timeout: bool = True
):
    """
    Setup all middleware in correct order
    Order matters! They execute in reverse order of addition
    """
    
    # 1. CORS (first to handle preflight)
    add_cors_middleware(app)
    
    # 2. Compression
    add_compression_middleware(app)
    
    # 3. Error Handler (catch all errors)
    app.add_middleware(ErrorHandlerMiddleware)
    
    # 4. Timeout (if enabled)
    if enable_timeout:
        app.add_middleware(TimeoutMiddleware)
    
    # 5. Request Logging
    app.add_middleware(RequestLoggingMiddleware)
    
    # 6. Request ID (needed for logging)
    app.add_middleware(RequestIDMiddleware)
    
    # 7. Security Headers
    app.add_middleware(SecurityHeadersMiddleware)
    
    # 8. Authentication (if enabled)
    if enable_auth:
        app.add_middleware(AuthenticationMiddleware)