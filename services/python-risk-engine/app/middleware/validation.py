"""
Request/Response validation and error handling middleware.

This module provides middleware for:
- Validating request data against Pydantic models
- Formatting validation errors consistently
- Handling common exceptions
- Adding request/response logging
"""
import json
import logging
from typing import Any, Awaitable, Callable, Dict, Optional, Type, TypeVar, Union

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware import Middleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.schemas.common import ErrorResponse, HTTPValidationError
from app.schemas.auth import TokenResponse

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=BaseModel)

class ValidationMiddleware(BaseHTTPMiddleware):
    """Middleware for request/response validation and error handling."""
    
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Log incoming request
        await self.log_request(request)
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Log the response
            await self.log_response(request, response)
            
            return response
            
        except RequestValidationError as exc:
            # Handle request validation errors
            return await self.handle_validation_error(exc, request)
            
        except HTTPException as exc:
            # Handle HTTP exceptions
            return await self.handle_http_exception(exc, request)
            
        except Exception as exc:
            # Handle unexpected errors
            return await self.handle_unexpected_error(exc, request)
    
    async def log_request(self, request: Request) -> None:
        """Log incoming requests with relevant details."""
        # Skip logging for health checks and metrics
        if request.url.path in ['/health', '/metrics']:
            return
            
        # Get request details
        client = request.client.host if request.client else "unknown"
        method = request.method
        url = str(request.url)
        
        # Log basic request info
        logger.info(
            f"Request: {method} {url} from {client}"
        )
        
        # Log request body for non-GET requests (with size limit)
        if method != "GET":
            try:
                body = await request.body()
                if body:
                    # Log first 1KB of body to avoid logging large payloads
                    body_preview = body[:1024].decode('utf-8', errors='replace')
                    logger.debug(f"Request body: {body_preview}")
            except Exception as e:
                logger.warning(f"Failed to log request body: {str(e)}")
    
    async def log_response(
        self, request: Request, response: Response
    ) -> None:
        """Log outgoing responses with relevant details."""
        # Skip logging for health checks and metrics
        if request.url.path in ['/health', '/metrics']:
            return
            
        # Get response details
        client = request.client.host if request.client else "unknown"
        method = request.method
        url = str(request.url)
        status_code = response.status_code
        
        # Log basic response info
        logger.info(
            f"Response: {method} {url} -> {status_code} to {client}"
        )
        
        # Log error responses with details
        if status_code >= 400:
            try:
                # For JSON responses, log the error details
                if hasattr(response, 'body'):
                    body = getattr(response, 'body', b'')
                    if body:
                        try:
                            error_details = json.loads(body)
                            logger.error(
                                f"Error response: {error_details}"
                            )
                        except json.JSONDecodeError:
                            logger.error(f"Error response (non-JSON): {body}")
            except Exception as e:
                logger.warning(f"Failed to log error response: {str(e)}")
    
    async def handle_validation_error(
        self, exc: RequestValidationError, request: Request
    ) -> JSONResponse:
        """Handle request validation errors."""
        logger.warning(f"Request validation error: {str(exc)}")
        
        # Format validation errors
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"][1:])  # Skip 'body' in loc
            errors.append({
                "loc": [field],
                "msg": error["msg"],
                "type": error["type"],
            })
        
        # Create error response
        error_response = ErrorResponse(
            error="Validation Error",
            code="validation_error",
            details={"errors": errors}
        )
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=jsonable_encoder(error_response.dict()),
        )
    
    async def handle_http_exception(
        self, exc: HTTPException, request: Request
    ) -> JSONResponse:
        """Handle HTTP exceptions."""
        logger.warning(
            f"HTTP {exc.status_code} error: {exc.detail}"
        )
        
        # Create error response
        error_response = ErrorResponse(
            error=exc.detail,
            code=getattr(exc, "code", f"http_{exc.status_code}"),
        )
        
        return JSONResponse(
            status_code=exc.status_code,
            headers=exc.headers,
            content=jsonable_encoder(error_response.dict()),
        )
    
    async def handle_unexpected_error(
        self, exc: Exception, request: Request
    ) -> JSONResponse:
        """Handle unexpected errors."""
        logger.error(
            f"Unexpected error processing {request.method} {request.url}: {str(exc)}",
            exc_info=True,
        )
        
        # Create error response
        error_response = ErrorResponse(
            error="Internal Server Error",
            code="internal_server_error",
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=jsonable_encoder(error_response.dict()),
        )

def validate_request(model: Type[T]) -> Callable[[T], Awaitable[T]]:
    """Decorator to validate request data against a Pydantic model."""
    async def decorator(request: Request) -> T:
        try:
            # Parse and validate request data
            if request.method == "GET":
                data = dict(request.query_params)
            else:
                content_type = request.headers.get("content-type", "")
                if "application/json" in content_type:
                    data = await request.json()
                elif "form-data" in content_type:
                    form_data = await request.form()
                    data = dict(form_data)
                    
                    # Handle file uploads
                    files = {}
                    for key, value in form_data.multi_items():
                        if hasattr(value, "file"):
                            files[key] = value
                    if files:
                        data["_files"] = files
                else:
                    data = {}
            
            # Validate against the model
            return model(**data)
            
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload",
            )
        except ValidationError as e:
            raise RequestValidationError(e.errors())
    
    return decorator

def validate_response(model: Type[T]) -> Callable[[Any], Dict[str, Any]]:
    """Decorator to validate response data against a Pydantic model."""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        async def wrapper(*args: Any, **kwargs: Any) -> Dict[str, Any]:
            # Call the original function
            result = await func(*args, **kwargs)
            
            # If it's already a Response object, return as-is
            if isinstance(result, Response):
                return result
                
            # Validate the result against the model
            try:
                if isinstance(result, dict):
                    validated = model(**result)
                else:
                    validated = model(result)
                
                # Convert to dict for JSON serialization
                return jsonable_encoder(validated.dict())
                
            except ValidationError as e:
                logger.error(f"Response validation error: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Response validation failed",
                )
        
        return wrapper
    
    return decorator

def setup_validation_middleware(app: FastAPI) -> None:
    """Set up validation middleware for the FastAPI app."""
    # Add validation middleware
    app.add_middleware(ValidationMiddleware)
    
    # Add exception handlers
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return await ValidationMiddleware().handle_validation_error(exc, request)
    
    @app.exception_handler(HTTPException)
    async def http_exception_handler(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        return await ValidationMiddleware().handle_http_exception(exc, request)
    
    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        return await ValidationMiddleware().handle_unexpected_error(exc, request)
