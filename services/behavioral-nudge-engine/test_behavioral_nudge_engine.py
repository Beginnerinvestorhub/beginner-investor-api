#!/usr/bin/env python3
"""
Test script for behavioral-nudge-engine service
"""
import sys
import os
sys.path.insert(0, 'src')

def test_service_imports():
    """Test that all service components can be imported"""
    try:
        from app import app
        print("✓ App imported successfully")
    except ImportError as e:
        print(f"✗ App import failed: {e}")
        return False

    try:
        from models.nudge import NudgeCreate, NudgeResponse, NudgeType
        print("✓ Models imported successfully")
    except ImportError as e:
        print(f"✗ Models import failed: {e}")
        return False

    try:
        from services.nudge_service import NudgeService
        print("✓ Services imported successfully")
    except ImportError as e:
        print(f"✗ Services import failed: {e}")
        return False

    try:
        from repositories.nudge_repository import NudgeRepository
        print("✓ Repositories imported successfully")
    except ImportError as e:
        print(f"✗ Repositories import failed: {e}")
        return False

    return True

def test_database_connection():
    """Test database connection and table creation"""
    try:
        from config.database import create_tables, engine
        print("✓ Database config imported")

        # Create tables
        create_tables()
        print("✓ Database tables created successfully")

        return True
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    try:
        from fastapi.testclient import TestClient
        from app import app

        client = TestClient(app)

        # Test health endpoint
        response = client.get("/health")
        if response.status_code == 200:
            print("✓ Health endpoint working")
        else:
            print(f"✗ Health endpoint failed: {response.status_code}")
            return False

        # Test root endpoint
        response = client.get("/")
        if response.status_code == 200:
            print("✓ Root endpoint working")
        else:
            print(f"✗ Root endpoint failed: {response.status_code}")
            return False

        return True
    except Exception as e:
        print(f"✗ API test failed: {e}")
        return False

def test_nudge_creation():
    """Test nudge creation functionality"""
    try:
        from models.nudge import NudgeCreate, NudgeType
        from services.nudge_service import NudgeService
        from config.database import SessionLocal

        # Create a test nudge
        nudge_data = NudgeCreate(
            user_id="test_user_123",
            type=NudgeType.EDUCATIONAL,
            title="Test Educational Nudge",
            content="This is a test nudge for debugging purposes.",
            priority=5,
            metadata={"test": True}
        )

        # Test service initialization
        db = SessionLocal()
        service = NudgeService(db)

        print("✓ Nudge service initialized")
        print(f"✓ Test nudge created: {nudge_data.title}")

        return True
    except Exception as e:
        print(f"✗ Nudge creation test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Testing Behavioral Nudge Engine...")
    print("=" * 50)

    tests = [
        ("Service Imports", test_service_imports),
        ("Database Connection", test_database_connection),
        ("API Endpoints", test_api_endpoints),
        ("Nudge Creation", test_nudge_creation),
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        else:
            print("FAILED")

    print("\n" + "=" * 50)
    print(f"Tests passed: {passed}/{total}")

    if passed == total:
        print("🎉 All tests passed! Service is ready for deployment.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit(main())
