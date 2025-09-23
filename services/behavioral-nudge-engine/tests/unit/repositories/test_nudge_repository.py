import pytest
from datetime import datetime, timedelta
from unittest.mock import MagicMock
from sqlalchemy.orm import Session

from src.models.nudge import Nudge, NudgeCreate, NudgeStatus, NudgeType
from src.repositories.nudge_repository import NudgeRepository

def test_create_nudge(db_session: Session):
    """Test creating a new nudge in the repository."""
    repo = NudgeRepository(db_session)
    nudge_data = NudgeCreate(
        user_id="user_123",
        type=NudgeType.EDUCATIONAL,
        title="Learn More",
        content="Check out our learning resources",
        priority=3,
        metadata={"category": "education"}
    )
    
    # Create the nudge
    created_nudge = repo.create(nudge_data.dict())
    
    # Verify the nudge was created with the correct data
    assert created_nudge.id is not None
    assert created_nudge.user_id == "user_123"
    assert created_nudge.type == NudgeType.EDUCATIONAL
    assert created_nudge.status == NudgeStatus.PENDING
    assert created_nudge.priority == 3
    assert created_nudge.metadata == {"category": "education"}
    assert created_nudge.created_at is not None
    assert created_nudge.updated_at is not None

def test_get_nudge_by_id(db_session: Session):
    """Test retrieving a nudge by its ID."""
    # First create a nudge
    repo = NudgeRepository(db_session)
    nudge_data = NudgeCreate(
        user_id="user_123",
        type=NudgeType.ACTION,
        title="Action Required",
        content="Please complete your profile"
    )
    created_nudge = repo.create(nudge_data.dict())
    
    # Now retrieve it
    retrieved_nudge = repo.get_by_id(created_nudge.id)
    
    # Verify we got the right nudge back
    assert retrieved_nudge is not None
    assert retrieved_nudge.id == created_nudge.id
    assert retrieved_nudge.title == "Action Required"

def test_list_nudges_by_user(db_session: Session):
    """Test listing nudges for a specific user with filters."""
    repo = NudgeRepository(db_session)
    
    # Create test data
    nudge1 = repo.create({
        "user_id": "user_123",
        "type": NudgeType.EDUCATIONAL,
        "title": "Learn 1",
        "content": "Content 1",
        "status": NudgeStatus.VIEWED
    })
    
    nudge2 = repo.create({
        "user_id": "user_123",
        "type": NudgeType.ACTION,
        "title": "Action 1",
        "content": "Action content",
        "status": NudgeStatus.PENDING
    })
    
    nudge3 = repo.create({
        "user_id": "user_456",  # Different user
        "type": NudgeType.EDUCATIONAL,
        "title": "Learn 2",
        "content": "Content 2"
    })
    
    # Test filtering by user
    user_nudges = repo.list_by_user("user_123")
    assert len(user_nudges) == 2
    assert all(n.user_id == "user_123" for n in user_nudges)
    
    # Test filtering by status
    pending_nudges = repo.list_by_user("user_123", status=NudgeStatus.PENDING)
    assert len(pending_nudges) == 1
    assert pending_nudges[0].id == nudge2.id
    
    # Test filtering by type
    edu_nudges = repo.list_by_user("user_123", nudge_type=NudgeType.EDUCATIONAL)
    assert len(edu_nudges) == 1
    assert edu_nudges[0].id == nudge1.id

def test_update_nudge_status(db_session: Session):
    """Test updating a nudge's status and timestamps."""
    repo = NudgeRepository(db_session)
    
    # Create a nudge
    nudge = repo.create({
        "user_id": "user_123",
        "type": NudgeType.REMINDER,
        "title": "Reminder",
        "content": "Don't forget!"
    })
    
    # Update status to SENT
    updated_nudge = repo.update_status(
        nudge.id, 
        NudgeStatus.SENT,
        sent_at=datetime.utcnow()
    )
    
    assert updated_nudge.status == NudgeStatus.SENT
    assert updated_nudge.sent_at is not None
    assert updated_nudge.updated_at > nudge.updated_at
    
    # Update status to VIEWED
    updated_nudge = repo.update_status(
        nudge.id,
        NudgeStatus.VIEWED,
        viewed_at=datetime.utcnow()
    )
    
    assert updated_nudge.status == NudgeStatus.VIEWED
    assert updated_nudge.viewed_at is not None

def test_delete_nudge(db_session: Session):
    """Test deleting a nudge."""
    repo = NudgeRepository(db_session)
    
    # Create a nudge
    nudge = repo.create({
        "user_id": "user_123",
        "type": NudgeType.EDUCATIONAL,
        "title": "To be deleted",
        "content": "This will be deleted"
    })
    
    # Delete the nudge
    result = repo.delete(nudge.id)
    assert result is True
    
    # Verify it's gone
    assert repo.get_by_id(nudge.id) is None
    
    # Test deleting non-existent nudge
    assert repo.delete("nonexistent") is False
