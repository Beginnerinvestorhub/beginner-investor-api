import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import sys

# Add the src directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.database import Base, get_db
from src.main import app

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    """Create a new database session with a rollback at the end of the test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="module")
def client():
    """Create a test client for the FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client

# Test user data for authentication
@pytest.fixture
def test_user():
    return {
        "id": "test_user_123",
        "email": "test@example.com",
        "is_admin": False
    }

# Mock authentication
@pytest.fixture
def mock_auth(test_user, monkeypatch):
    from fastapi import HTTPException, status
    from fastapi.security import OAuth2PasswordBearer
    
    async def mock_get_current_user():
        return test_user
    
    # Mock the OAuth2PasswordBearer to return a test token
    def mock_oauth2_scheme():
        return "test_token"
    
    # Apply the mocks
    monkeypatch.setattr("src.api.v1.endpoints.nudges.get_current_user", mock_get_current_user)
    monkeypatch.setattr(OAuth2PasswordBearer, "__call__", mock_oauth2_scheme)
    
    return test_user
