""
API v1 Package

This package contains version 1 of the API endpoints.
"""

from fastapi import APIRouter
from .endpoints import nudges

api_router = APIRouter()
api_router.include_router(nudges.router, prefix="/nudges", tags=["nudges"])

__all__ = ['api_router']
