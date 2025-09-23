import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta

from src.models.nudge import (
    NudgeCreate, NudgeResponse, NudgeStatus, NudgeType, NudgeInDB
)
from src.services.nudge_service import NudgeService

# Mock data
SAMPLE_USER_ID = "user_123"
SAMPLE_NUDGE_ID = "nudge_123"

def test_create_nudge_success():
    """Test creating a nudge with valid data."""
    # Setup
    mock_db = MagicMock()
    service = NudgeService(mock_db)
    
    nudge_data = NudgeCreate(
        user_id=SAMPLE_USER_ID,
        type=NudgeType.EDUCATIONAL,
        title="Learn More",
        content="Check out our learning resources",
        priority=3
    )
    
    # Mock the repository response
    expected_nudge = NudgeInDB(
        id=SAMPLE_NUDGE_ID,
        **nudge_data.dict(),
        status=NudgeStatus.PENDING,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    with patch.object(service.repository, 'create', return_value=expected_nudge) as mock_create:
        # Execute
        result = service.create_nudge(nudge_data)
        
        # Verify
        assert isinstance(result, NudgeResponse)
        assert result.id == SAMPLE_NUDGE_ID
        assert result.user_id == SAMPLE_USER_ID
        assert result.type == NudgeType.EDUCATIONAL
        assert result.status == NudgeStatus.PENDING
        mock_create.assert_called_once()

def test_apply_educational_nudge_rules():
    """Test business rules for educational nudges."""
    # Setup
    mock_db = MagicMock()
    service = NudgeService(mock_db)
    
    nudge_data = NudgeCreate(
        user_id=SAMPLE_USER_ID,
        type=NudgeType.EDUCATIONAL,
        title="Learn More",
        content="Check this out"
        # No priority or metadata provided
    )
    
    # Execute
    result = service._apply_educational_nudge_rules(nudge_data)
    
    # Verify
    assert result.priority == 3  # Default priority for educational nudges
    assert result.metadata.get('category') == 'general_education'

def test_update_nudge_status_flow():
    """Test the complete status flow of a nudge."""
    # Setup
    mock_db = MagicMock()
    service = NudgeService(mock_db)
    
    # Mock the repository responses
    pending_nudge = NudgeInDB(
        id=SAMPLE_NUDGE_ID,
        user_id=SAMPLE_USER_ID,
        type=NudgeType.REMINDER,
        status=NudgeStatus.PENDING,
        title="Reminder",
        content="Don't forget!",
        created_at=datetime.utcnow()
    )
    
    sent_nudge = NudgeInDB(
        **pending_nudge.dict(),
        status=NudgeStatus.SENT,
        sent_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    viewed_nudge = NudgeInDB(
        **sent_nudge.dict(),
        status=NudgeStatus.VIEWED,
        viewed_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    # Mock the repository
    service.repository.get_by_id = MagicMock(return_value=pending_nudge)
    service.repository.update_status = MagicMock(side_effect=[sent_nudge, viewed_nudge])
    
    # Test SENT status
    result = service.update_nudge_status(SAMPLE_NUDGE_ID, NudgeStatus.SENT)
    assert result.status == NudgeStatus.SENT
    assert result.sent_at is not None
    
    # Test VIEWED status (should also mark as viewed if not already)
    service.repository.get_by_id.return_value = sent_nudge
    result = service.update_nudge_status(SAMPLE_NUDGE_ID, NudgeStatus.VIEWED)
    assert result.status == NudgeStatus.VIEWED
    assert result.viewed_at is not None

def test_nudge_conversion_tracking():
    """Test that conversions are properly tracked."""
    # Setup
    mock_db = MagicMock()
    service = NudgeService(mock_db)
    
    # Mock the repository
    nudge = NudgeInDB(
        id=SAMPLE_NUDGE_ID,
        user_id=SAMPLE_USER_ID,
        type=NudgeType.AFFILIATE,
        status=NudgeStatus.VIEWED,
        title="Special Offer",
        content="Get 20% off",
        created_at=datetime.utcnow()
    )
    
    converted_nudge = NudgeInDB(
        **nudge.dict(),
        status=NudgeStatus.CONVERTED,
        converted_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    service.repository.get_by_id = MagicMock(return_value=nudge)
    service.repository.update_status = MagicMock(return_value=converted_nudge)
    
    # Mock the analytics tracking
    with patch.object(service, '_handle_nudge_conversion') as mock_track:
        # Execute
        result = service.update_nudge_status(SAMPLE_NUDGE_ID, NudgeStatus.CONVERTED)
        
        # Verify
        assert result.status == NudgeStatus.CONVERTED
        mock_track.assert_called_once()

def test_unauthorized_nudge_access():
    """Test that users can only access their own nudges."""
    # Setup
    mock_db = MagicMock()
    service = NudgeService(mock_db)
    
    # Mock a nudge belonging to a different user
    other_user_nudge = NudgeInDB(
        id=SAMPLE_NUDGE_ID,
        user_id="other_user_456",  # Different user
        type=NudgeType.EDUCATIONAL,
        status=NudgeStatus.PENDING,
        title="Not Yours",
        content="This isn't your nudge"
    )
    
    service.repository.get_by_id = MagicMock(return_value=other_user_nudge)
    
    # Test that a user can't update someone else's nudge
    result = service.update_nudge_status(
        SAMPLE_NUDGE_ID, 
        NudgeStatus.VIEWED,
        user_id=SAMPLE_USER_ID  # Current user trying to update
    )
    
    # Should return None (not authorized)
    assert result is None
