from fastapi import FastAPI
from starlette.middleware.gzip import GZIPMiddleware
from .config import get_middleware_settings

settings = get_middleware_settings()

def add_compression_middleware(app: FastAPI):
    """Add GZIP compression middleware"""
    if settings.COMPRESSION_ENABLED:
        app.add_middleware(
            GZIPMiddleware,
            minimum_size=settings.COMPRESSION_MIN_SIZE
        )