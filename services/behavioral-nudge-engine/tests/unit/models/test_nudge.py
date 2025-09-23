import pytest
from datetime import datetime, timedelta
from src.models.nudge import (
    NudgeCreate, NudgeUpdate, NudgeInDB, NudgeType, NudgeStatus
)

def test_nudge_create():
    """Test creating a nudge with valid data."""
    nudge_data = {
        "user_id": "user_123",
        "type": NudgeType.EDUCATIONAL,
        "title": "Test Nudge",
        "content": "This is a test nudge",
        "priority": 5,
        "metadata": {"key": "value"}
    }
    nudge = NudgeCreate(**nudge_data)
    
    assert nudge.user_id == "user_123"
    assert nudge.type == NudgeType.EDUCATIONAL
    assert nudge.title == "Test Nudge"
    assert nudge.priority == 5
    assert nudge.metadata == {"key": "value"}

def test_nudge_update():
    """Test updating a nudge with partial data."""
    update_data = {
        "status": NudgeStatus.VIEWED,
        "metadata": {"new_key": "new_value"}
    }
    update = NudgeUpdate(**update_data)
    
    assert update.status == NudgeStatus.VIEWED
    assert update.metadata == {"new_key": "new_value"}

def test_nudge_in_db():
    """Test the database model with all required fields."""
    now = datetime.utcnow()
    nudge_data = {
        "id": "test_123",
        "user_id": "user_123",
        "type": NudgeType.ACTION,
        "status": NudgeStatus.PENDING,
        "title": "Action Required",
        "content": "Please complete this action",
        "priority": 7,
        "metadata": {"action": "verify_email"},
        "created_at": now,
        "updated_at": now
    }
    
    nudge = NudgeInDB(**nudge_data)
    
    assert nudge.id == "test_123"
    assert nudge.type == NudgeType.ACTION
    assert nudge.status == NudgeStatus.PENDING
    assert nudge.priority == 7
    assert nudge.created_at == now

def test_nudge_validation():
    """Test validation of nudge data."""
    # Test invalid priority
    with pytest.raises(ValueError):
        NudgeCreate(
            user_id="user_123",
            type=NudgeType.EDUCATIONAL,
            title="Test",
            content="Test content",
            priority=11  # Should be 0-10
        )
    
    # Test missing required field
    with pytest.raises(ValueError):
        NudgeCreate(
            user_id="user_123",
            type=NudgeType.EDUCATIONAL,
            # Missing title
            content="Test content"
        )

def test_nudge_status_transitions():
    """Test nudge status transitions."""
    nudge = NudgeInDB(
        id="test_123",
        user_id="user_123",
        type=NudgeType.REMINDER,
        status=NudgeStatus.PENDING,
        title="Reminder",
        content="Don't forget!"
    )
    
    # Test status transition to SENT
    nudge.status = NudgeStatus.SENT
    assert nudge.status == NudgeStatus.SENT
    
    # Test status transition to VIEWED
    nudge.status = NudgeStatus.VIEWED
    assert nudge.status == NudgeStatus.VIEWED
    
    # Test invalid status transition (can't go back to PENDING)
    with pytest.raises(ValueError):
        nudge.status = NudgeStatus.PENDING
