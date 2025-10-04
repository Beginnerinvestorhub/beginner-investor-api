from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from ..models.nudge import (
    Nudge, NudgeStatus, NudgeType, NudgeCreate, NudgeUpdate, NudgeInDB, NudgeResponse
)
from ..repositories.nudge_repository import NudgeRepository

import logging
logger = logging.getLogger(__name__)

class NudgeService:
    """
    Service layer for handling all nudge-related business logic.
    
    This service acts as an intermediary between the API endpoints and the data access layer,
    enforcing business rules and orchestrating complex operations.
    
    Attributes:
        repository: An instance of NudgeRepository for database operations
    """
    
    def __init__(self, db: Session):
        """
        Initialize the nudge service with a database session.
        
        Args:
            db: SQLAlchemy database session for data access
        """
        self.repository = NudgeRepository(db)
    
    def create_nudge(self, nudge_data: NudgeCreate) -> NudgeResponse:
        """
        Create a new nudge with validation and business logic.
        
        This method handles the creation of a new nudge, applying type-specific
        business rules before persisting to the database.
        
        Args:
            nudge_data: NudgeCreate object containing the nudge data
            
        Returns:
            NudgeResponse: The created nudge with generated fields
            
        Raises:
            ValueError: If the nudge data is invalid
            HTTPException: If there's an error creating the nudge
        """
        logger.info(f"Creating nudge for user {nudge_data.user_id}")
        
        # Apply business rules based on nudge type
        if nudge_data.type == NudgeType.EDUCATIONAL:
            nudge_data = self._apply_educational_nudge_rules(nudge_data)
        elif nudge_data.type == NudgeType.AFFILIATE:
            nudge_data = self._apply_affiliate_nudge_rules(nudge_data)
            
        try:
            # Create the nudge in the database
            nudge = self.repository.create(nudge_data)
            logger.info(f"Successfully created nudge {nudge.id}")
            return NudgeResponse.from_orm(nudge)
        except Exception as e:
            logger.error(f"Error creating nudge: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create nudge"
            )
    
    def get_nudge(self, nudge_id: str) -> Optional[NudgeResponse]:
        """
        Retrieve a nudge by its unique identifier.
        
        Args:
            nudge_id: The unique identifier of the nudge to retrieve
            
        Returns:
            Optional[NudgeResponse]: The requested nudge if found, None otherwise
            
        Raises:
            HTTPException: If there's an error accessing the database
        """
        try:
            nudge = self.repository.get_by_id(nudge_id)
            if nudge:
                return NudgeResponse.from_orm(nudge)
            return None
        except Exception as e:
            logger.error(f"Error retrieving nudge {nudge_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve nudge"
            )
    
    def list_user_nudges(
        self, 
        user_id: str,
        status: Optional[NudgeStatus] = None,
        nudge_type: Optional[NudgeType] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[NudgeResponse]:
        """
        Retrieve a paginated list of nudges for a specific user with optional filtering.
        
        Args:
            user_id: The ID of the user whose nudges to retrieve
            status: Optional status to filter by
            nudge_type: Optional nudge type to filter by
            limit: Maximum number of results to return (1-100, default: 10)
            offset: Number of results to skip for pagination (default: 0)
            
        Returns:
            List[NudgeResponse]: A list of nudges matching the criteria
            
        Raises:
            HTTPException: If there's an error retrieving the nudges
        """
        try:
            # Validate and sanitize inputs
            limit = max(1, min(100, limit))  # Enforce limit between 1 and 100
            offset = max(0, offset)  # Ensure offset is not negative
            
            # Retrieve nudges from repository
            nudges = self.repository.list_by_user(
                user_id=user_id,
                status=status,
                nudge_type=nudge_type,
                limit=limit,
                offset=offset
            )
            
            return [NudgeResponse.from_orm(n) for n in nudges]
            
        except Exception as e:
            logger.error(f"Error listing nudges for user {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve nudges"
            )
    
    def update_nudge_status(
        self, 
        nudge_id: str, 
        status: NudgeStatus,
        user_id: Optional[str] = None,
        **update_values: Any
    ) -> Optional[NudgeResponse]:
        """
        Update a nudge's status with validation and business rules.
        
        Handles status transitions and triggers any associated actions.
        
        Args:
            nudge_id: The ID of the nudge to update
            status: The new status to set
            user_id: Optional user ID for authorization
            **update_values: Additional fields to update
            
        Returns:
            Optional[NudgeResponse]: The updated nudge if successful, None otherwise
            
        Raises:
            HTTPException: If there's an error updating the nudge
        """
        try:
            # Retrieve the nudge
            nudge = self.repository.get_by_id(nudge_id)
            if not nudge:
                logger.warning(f"Nudge {nudge_id} not found for status update")
                return None
                
            # Verify ownership if user_id is provided
            if user_id and nudge.user_id != user_id:
                logger.warning(f"User {user_id} is not authorized to update nudge {nudge_id}")
                return None
                
            # Apply business rules based on status transition
            if status == NudgeStatus.CLICKED and nudge.status != NudgeStatus.VIEWED:
                # If nudge was clicked without being viewed, mark as viewed first
                self.repository.update_status(nudge_id, NudgeStatus.VIEWED)
            
            # Update the status
            updated_nudge = self.repository.update_status(nudge_id, status, **update_values)
            if updated_nudge:
                self._trigger_post_status_update_actions(updated_nudge, status)
                logger.info(f"Successfully updated nudge {nudge_id} status to {status}")
                return NudgeResponse.from_orm(updated_nudge)
            return None
            
        except Exception as e:
            logger.error(f"Error updating nudge {nudge_id} status: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update nudge status: {str(e)}"
            )
    
    def _apply_educational_nudge_rules(self, nudge_data: NudgeCreate) -> NudgeCreate:
        """Apply business rules specific to educational nudges."""
        # Example: Set default priority for educational nudges
        if nudge_data.priority is None:
            nudge_data.priority = 3
            
        # Example: Add educational metadata if not provided
        if 'category' not in nudge_data.metadata:
            nudge_data.metadata['category'] = 'general_education'
            
        return nudge_data
    
    def _apply_affiliate_nudge_rules(self, nudge_data: NudgeCreate) -> NudgeCreate:
        """Apply business rules specific to affiliate nudges."""
        # Example: Set default priority for affiliate nudges
        if nudge_data.priority is None:
            nudge_data.priority = 5  # Higher priority for revenue-generating nudges
            
        # Example: Ensure affiliate ID is present in metadata
        if 'affiliate_id' not in nudge_data.metadata:
            raise ValueError("Affiliate ID is required for affiliate nudges")
            
        return nudge_data
    
    def _trigger_post_status_update_actions(
        self, 
        nudge: NudgeInDB, 
        new_status: NudgeStatus
    ) -> None:
        """Trigger any actions needed after a nudge status update."""
        if new_status == NudgeStatus.CONVERTED:
            self._handle_nudge_conversion(nudge)
        elif new_status == NudgeStatus.CLICKED:
            self._track_nudge_click(nudge)
    
    def _handle_nudge_conversion(self, nudge: NudgeInDB) -> None:
        """Handle actions when a nudge results in a conversion."""
        logger.info(f"Nudge {nudge.id} converted for user {nudge.user_id}")
        
        # Example: Track conversion in analytics
        # analytics.track_conversion(
        #     user_id=nudge.user_id,
        #     nudge_id=nudge.id,
        #     nudge_type=nudge.type,
        #     metadata=nudge.metadata
        # )
    
    def _track_nudge_click(self, nudge: NudgeInDB) -> None:
        """Track when a nudge is clicked."""
        logger.info(f"Nudge {nudge.id} was clicked by user {nudge.user_id}")
        
        # Example: Track click in analytics
        # analytics.track_click(
        #     user_id=nudge.user_id,
        #     nudge_id=nudge.id,
        #     nudge_type=nudge.type,
        #     metadata=nudge.metadata
        # )
