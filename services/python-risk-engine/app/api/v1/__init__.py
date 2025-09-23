""
API v1 package for the Python Engine service.

This package contains version 1 of the API, including all endpoints and routers.
"""

# Import the API router to make it available when importing from the package
from .api import api_router

__all__ = ["api_router"]
