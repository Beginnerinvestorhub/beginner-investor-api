#!/usr/bin/env python3
"""
Startup script for Firebase Authentication Service
"""
import os
import sys
import uvicorn
import logging
from pathlib import Path

# Add shared directory to path
shared_dir = Path(__file__).parent.parent / "shared"
sys.path.insert(0, str(shared_dir))

from shared.auth.main import app
from shared.config import get_config, get_logging_config

def main():
    """Start the authentication service"""
    # Configure logging
    logging_config = get_logging_config()
    logging.basicConfig(
        level=getattr(logging, logging_config['level']),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    config = get_config()

    logger = logging.getLogger(__name__)
    logger.info("Starting Firebase Authentication Service...")

    # Check required environment variables
    required_env_vars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY',
        'JWT_SECRET_KEY',
        'DATABASE_URL'
    ]

    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)

    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.info("Please check your .env file or environment configuration")
        sys.exit(1)

    # Start server
    try:
        uvicorn.run(
            "shared.auth.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level=logging_config['level'].lower(),
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Shutting down authentication service...")
    except Exception as e:
        logger.error(f"Failed to start authentication service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
