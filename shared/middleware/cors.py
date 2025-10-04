from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .config import get_middleware_settings

settings = get_middleware_settings()

def add_cors_middleware(app: FastAPI):
    """Add CORS middleware to FastAPI app"""
    if settings.CORS_ENABLED:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ALLOW_ORIGINS,
            allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
            allow_methods=settings.CORS_ALLOW_METHODS,
            allow_headers=settings.CORS_ALLOW_HEADERS,
        )