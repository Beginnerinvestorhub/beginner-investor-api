import pytest
from fastapi import status
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from src.main import app
from src.models.nudge import NudgeType, NudgeStatus, NudgeCreate, NudgeInDB

# Test client
client = TestClient(app)

# Test data
TEST_USER_ID = "test_user_123"
TEST_NUDGE_ID = "test_nudge_456"

def test_create_nudge_success(mock_auth, db_session):
    """Test creating a nudge via the API."""
    # Prepare test data
    nudge_data = {
        "user_id": TEST_USER_ID,
        "type": "educational",
        "title": "Learn About Investing",
        "content": "Check out our beginner's guide to investing",
        "priority": 5,
        "metadata": {"category": "investing_basics"}
    }
    
    # Make the request
    response = client.post("/nudges/", json=nudge_data, headers={"Authorization": "Bearer test_token"})
    
    # Verify the response
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user_id"] == TEST_USER_ID
    assert data["type"] == "educational"
    assert data["status"] == "pending"
    assert data["title"] == "Learn About Investing"
    assert data["metadata"]["category"] == "investing_basics"
    assert "id" in data

def test_get_nudge_success(mock_auth, db_session):
    """Test retrieving a nudge by ID."""
    # First create a test nudge
    nudge_data = NudgeCreate(
        user_id=TEST_USER_ID,
        type=NudgeType.EDUCATIONAL,
        title="Test Nudge",
        content="Test content"
    )
    
    # Save to database
    from src.repositories.nudge_repository import NudgeRepository
    repo = NudgeRepository(db_session)
    nudge = repo.create(nudge_data.dict())
    
    # Now retrieve it via the API
    response = client.get(f"/nudges/{nudge.id}", headers={"Authorization": "Bearer test_token"})
    
    # Verify the response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == nudge.id
    assert data["title"] == "Test Nudge"
    assert data["user_id"] == TEST_USER_ID

def test_list_nudges_filtering(mock_auth, db_session):
    """Test listing nudges with filtering."""
    # Create test data
    from src.repositories.nudge_repository import NudgeRepository
    repo = NudgeRepository(db_session)
    
    # Create multiple nudges with different statuses
    nudge1 = repo.create({
        "user_id": TEST_USER_ID,
        "type": "educational",
        "title": "Learn 1",
        "content": "Content 1",
        "status": "viewed"
    })
    
    nudge2 = repo.create({
        "user_id": TEST_USER_ID,
        "type": "action",
        "title": "Action 1",
        "content": "Action content",
        "status": "pending"
    })
    
    # Test filtering by status
    response = client.get(
        "/nudges/",
        params={"status": "pending"},
        headers={"Authorization": "Bearer test_token"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == nudge2.id
    assert data["items"][0]["status"] == "pending"
    
    # Test filtering by type
    response = client.get(
        "/nudges/",
        params={"nudge_type": "educational"},
        headers={"Authorization": "Bearer test_token"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == nudge1.id
    assert data["items"][0]["type"] == "educational"

def test_update_nudge_status(mock_auth, db_session):
    """Test updating a nudge's status."""
    # Create a test nudge
    from src.repositories.nudge_repository import NudgeRepository
    repo = NudgeRepository(db_session)
    
    nudge = repo.create({
        "user_id": TEST_USER_ID,
        "type": "reminder",
        "title": "Reminder",
        "content": "Don't forget!",
        "status": "pending"
    })
    
    # Update the status
    update_data = {
        "status": "viewed"
    }
    
    response = client.patch(
        f"/nudges/{nudge.id}",
        json=update_data,
        headers={"Authorization": "Bearer test_token"}
    )
    
    # Verify the response
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "viewed"
    assert data["viewed_at"] is not None
    
    # Verify in the database
    updated_nudge = repo.get_by_id(nudge.id)
    assert updated_nudge.status == NudgeStatus.VIEWED
    assert updated_nudge.viewed_at is not None

def test_unauthorized_access(mock_auth, db_session):
    """Test that users can't access each other's nudges."""
    # Create a nudge for a different user
    from src.repositories.nudge_repository import NudgeRepository
    repo = NudgeRepository(db_session)
    
    nudge = repo.create({
        "user_id": "other_user_456",  # Different user
        "type": "educational",
        "title": "Private Nudge",
        "content": "You shouldn't see this",
        "status": "pending"
    })
    
    # Try to access the nudge
    response = client.get(
        f"/nudges/{nudge.id}",
        headers={"Authorization": "Bearer test_token"}
    )
    
    # Should be forbidden
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # Try to update the nudge
    response = client.patch(
        f"/nudges/{nudge.id}",
        json={"status": "viewed"},
        headers={"Authorization": "Bearer test_token"}
    )
    
    # Should also be forbidden
    assert response.status_code == status.HTTP_403_FORBIDDEN
