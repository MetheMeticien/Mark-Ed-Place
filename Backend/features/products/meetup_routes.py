from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from features.authentication.models import User
from features.authentication.auth_jwt import get_current_user
from database import get_db
from . import schemas, crud, models
from .meetup_crud import (
    create_meetup as create_meetup_db,
    get_meetup as get_meetup_db,
    get_meetups as get_meetups_db,
    get_buyer_meetups as get_buyer_meetups_db,
    get_product_meetups as get_product_meetups_db,
    update_meetup_status,
    delete_meetup as delete_meetup_db
)

router = APIRouter(prefix="/meetups", tags=["meetups"])

@router.post("/", response_model=schemas.MeetupRead)
def create_meetup(
    meetup: schemas.MeetupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new meetup request"""
    try:
        return create_meetup_db(db, meetup, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.MeetupRead])
def get_meetups(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meetups (admin only)"""
    # This endpoint could be restricted to admins in a real application
    return get_meetups_db(db, skip, limit)

@router.get("/buyer", response_model=List[schemas.MeetupRead])
def get_buyer_meetups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meetups where the current user is the buyer"""
    return get_buyer_meetups_db(db, current_user.id)

@router.get("/seller", response_model=List[schemas.MeetupRead])
def get_seller_meetups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meetups where the current user is the seller"""
    from .meetup_crud import get_seller_meetups as get_seller_meetups_db
    return get_seller_meetups_db(db, current_user.id)

@router.get("/product/{product_id}", response_model=List[schemas.MeetupRead])
def get_product_meetups(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all meetups for a specific product"""
    meetups = get_product_meetups_db(db, product_id)
    
    # Only return meetups where the current user is either the buyer or seller
    return [m for m in meetups if m.buyer_id == current_user.id or m.seller_id == current_user.id]

@router.get("/{meetup_id}", response_model=schemas.MeetupRead)
def get_meetup(
    meetup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific meetup"""
    meetup = get_meetup_db(db, meetup_id)
    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Check if the current user is either the buyer or seller
    if meetup.buyer_id != current_user.id and meetup.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this meetup"
        )
    
    return meetup

@router.put("/{meetup_id}/accept", response_model=schemas.MeetupRead)
def accept_meetup(
    meetup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a meetup request (seller only)"""
    meetup = get_meetup_db(db, meetup_id)
    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Check if the current user is the seller
    if meetup.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can accept meetup requests"
        )
    
    # Check if the meetup is in PENDING status
    if meetup.status != models.MeetupStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot accept meetup in {meetup.status} status"
        )
    
    return update_meetup_status(db, meetup_id, models.MeetupStatus.ACCEPTED)

@router.put("/{meetup_id}/reject", response_model=schemas.MeetupRead)
def reject_meetup(
    meetup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a meetup request (seller only)"""
    meetup = get_meetup_db(db, meetup_id)
    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Check if the current user is the seller
    if meetup.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can reject meetup requests"
        )
    
    # Check if the meetup is in PENDING status
    if meetup.status != models.MeetupStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject meetup in {meetup.status} status"
        )
    
    return update_meetup_status(db, meetup_id, models.MeetupStatus.REJECTED)

@router.delete("/{meetup_id}")
def delete_meetup(
    meetup_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a meetup"""
    meetup = get_meetup_db(db, meetup_id)
    if not meetup:
        raise HTTPException(status_code=404, detail="Meetup not found")
    
    # Check if the current user is either the buyer or seller
    if meetup.buyer_id != current_user.id and meetup.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this meetup"
        )
    
    delete_meetup_db(db, meetup_id)
    return {"message": "Meetup deleted successfully"}
