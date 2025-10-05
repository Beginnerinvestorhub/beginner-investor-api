#!/usr/bin/env python3

import sys
import os

# Add the project root to Python path
sys.path.insert(0, 'd:\\beginnerinvestorhub')

print("Testing imports...")

try:
    import tenacity
    print("✓ tenacity imported successfully")
except ImportError as e:
    print(f"✗ tenacity import failed: {e}")

try:
    import sqlalchemy
    print("✓ sqlalchemy imported successfully")
except ImportError as e:
    print(f"✗ sqlalchemy import failed: {e}")

try:
    from shared.database.connection import SessionLocal
    print("✓ shared.database.connection imported successfully")
except ImportError as e:
    print(f"✗ shared.database.connection import failed: {e}")

try:
    from shared.database.models import User
    print("✓ shared.database.models imported successfully")
except ImportError as e:
    print(f"✗ shared.database.models import failed: {e}")

print("Import testing complete.")
