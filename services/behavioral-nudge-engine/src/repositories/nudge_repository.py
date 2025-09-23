from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from ...models.nudge import (
    Nudge, NudgeStatus, NudgeType, NudgeCreate, NudgeUpdate, NudgeInDB
)
from shared.utils.logger import get_logger

logger = get_logger(__name__)

class NudgeRepository:
    """Repository for handling nudge database operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, nudge_data: Dict[str, Any]) -> NudgeInDB:
        """Create a new nudge."""
        try:
            nudge = Nudge(**nudge_data.dict())
            self.db.add(nudge)
            self.db.commit()
            self.db.refresh(nudge)
            logger.info(f"Created nudge with ID: {nudge.id}")
            return nudge
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating nudge: {str(e)}")
            raise
    
    def get_by_id(self, nudge_id: str) -> Optional[NudgeInDB]:
        """Get a nudge by its ID."""
        try:
            return self.db.query(Nudge).filter(Nudge.id == nudge_id).first()
        except Exception as e:
            logger.error(f"Error fetching nudge {nudge_id}: {str(e)}")
            raise
    
    def list_by_user(
        self, 
        user_id: str, 
        status: Optional[NudgeStatus] = None,
        nudge_type: Optional[NudgeType] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[NudgeInDB]:
        """List nudges for a user with optional filtering and pagination."""
        try:
            query = self.db.query(Nudge).filter(Nudge.user_id == user_id)
            
            if status:
                query = query.filter(Nudge.status == status)
            if nudge_type:
                query = query.filter(Nudge.type == nudge_type)
                
            return query.offset(offset).limit(limit).all()
        except Exception as e:
            logger.error(f"Error listing nudges for user {user_id}: {str(e)}")
            raise
    
    def update_status(
        self, 
        nudge_id: str, 
        status: NudgeStatus,
        **update_values: Any
    ) -> Optional[NudgeInDB]:
        """Update a nudge's status and related timestamps."""
        try:
            nudge = self.get_by_id(nudge_id)
            if not nudge:
                logger.warning(f"Nudge {nudge_id} not found for status update")
                return None
                
            # Update status and timestamps
            nudge.status = status
            now = datetime.utcnow()
            
            # Update relevant timestamps based on status
            if status == NudgeStatus.SENT:
                nudge.sent_at = now
            elif status == NudgeStatus.VIEWED:
                nudge.viewed_at = now
            elif status == NudgeStatus.CLICKED:
                nudge.clicked_at = now
            elif status == NudgeStatus.DISMISSED:
                nudge.dismissed_at = now
            elif status == NudgeStatus.CONVERTED:
                nudge.converted_at = now
            
            # Update any additional fields
            for key, value in update_values.items():
                if hasattr(nudge, key):
                    setattr(nudge, key, value)
            
            nudge.updated_at = now
            self.db.commit()
            self.db.refresh(nudge)
            logger.info(f"Updated nudge {nudge_id} status to {status}")
            return nudge
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating nudge {nudge_id}: {str(e)}")
            raise
    
    def delete(self, nudge_id: str) -> bool:
        """Delete a nudge by ID."""
        try:
            nudge = self.get_by_id(nudge_id)
            if nudge:
                self.db.delete(nudge)
                self.db.commit()
                logger.info(f"Deleted nudge {nudge_id}")
                return True
            return False
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting nudge {nudge_id}: {str(e)}")
            raise
