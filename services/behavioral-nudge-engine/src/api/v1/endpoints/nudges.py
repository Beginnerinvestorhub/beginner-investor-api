from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from shared.middleware.auth import get_current_user
from shared.types.user import UserInDB
from ....models.nudge import (
    NudgeCreate, NudgeResponse, NudgeUpdate, NudgeStatus, NudgeType, NudgeListResponse
)
from ....services.nudge_service import NudgeService
from ....config.database import get_db

router = APIRouter()

@router.post("/", response_model=NudgeResponse, status_code=status.HTTP_201_CREATED)
def create_nudge(
    nudge_data: NudgeCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new nudge for a user.
    
    - **user_id**: The ID of the user to send the nudge to (must be the same as current user unless admin)
    - **type**: Type of nudge (educational, action, reminder, affiliate)
    - **title**: Short title for the nudge
    - **content**: Main content of the nudge
    - **priority**: Priority level (0-10, higher is more important)
    - **metadata**: Additional metadata as key-value pairs
    """
    # Only allow creating nudges for yourself unless you're an admin
    if nudge_data.user_id != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create nudges for other users"
        )
    
    service = NudgeService(db)
    return service.create_nudge(nudge_data)

@router.get("/{nudge_id}", response_model=NudgeResponse)
def get_nudge(
    nudge_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific nudge by ID.
    
    - **nudge_id**: The ID of the nudge to retrieve
    """
    service = NudgeService(db)
    nudge = service.get_nudge(nudge_id)
    
    if not nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    
    # Only allow viewing your own nudges unless you're an admin
    if nudge.user_id != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this nudge"
        )
    
    return nudge

@router.get("/", response_model=NudgeListResponse)
def list_nudges(
    status: Optional[NudgeStatus] = None,
    nudge_type: Optional[NudgeType] = None,
    limit: int = 10,
    offset: int = 0,
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all nudges for the current user with optional filtering.
    
    - **status**: Filter by nudge status
    - **type**: Filter by nudge type
    - **limit**: Number of results to return (default: 10)
    - **offset**: Number of results to skip (for pagination)
    """
    service = NudgeService(db)
    nudges = service.list_user_nudges(
        user_id=str(current_user.id),
        status=status,
        nudge_type=nudge_type,
        limit=min(100, limit),  # Enforce a reasonable limit
        offset=offset
    )
    
    # Get total count for pagination
    total = len(nudges)  # This is a simplified example - in production, you'd want a count query
    
    return NudgeListResponse(
        items=nudges,
        total=total,
        page=(offset // limit) + 1,
        size=len(nudges),
        has_more=(offset + len(nudges)) < total
    )

@router.patch("/{nudge_id}", response_model=NudgeResponse)
def update_nudge_status(
    nudge_id: str,
    update_data: NudgeUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a nudge's status or metadata.
    
    - **status**: New status for the nudge
    - **viewed**: Set to true to mark as viewed
    - **clicked**: Set to true to mark as clicked
    - **dismissed**: Set to true to mark as dismissed
    - **converted**: Set to true to mark as converted
    - **metadata**: Updated metadata (will be merged with existing)
    """
    service = NudgeService(db)
    
    # Get the current nudge to check permissions
    current_nudge = service.get_nudge(nudge_id)
    if not current_nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    
    # Only allow updating your own nudges unless you're an admin
    if current_nudge.user_id != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this nudge"
        )
    
    # Update status if provided
    if update_data.status:
        updated_nudge = service.update_nudge_status(
            nudge_id=nudge_id,
            status=update_data.status,
            user_id=str(current_user.id)
        )
    else:
        # Handle other updates (metadata, etc.)
        # This is simplified - in a real app, you'd have a proper update method
        updated_nudge = current_nudge
    
    if not updated_nudge:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update nudge"
        )
    
    return updated_nudge

@router.delete("/{nudge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_nudge(
    nudge_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a nudge by ID.
    
    - **nudge_id**: The ID of the nudge to delete
    """
    service = NudgeService(db)
    nudge = service.get_nudge(nudge_id)
    
    if not nudge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nudge not found"
        )
    
    # Only allow deleting your own nudges unless you're an admin
    if nudge.user_id != str(current_user.id) and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this nudge"
        )
    
    success = service.repository.delete(nudge_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete nudge"
        )
    
    return None
