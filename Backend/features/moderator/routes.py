from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from features.authentication.models import User
from features.authentication.auth_jwt import get_current_user
from database import get_db
from features.products import crud, schemas

router = APIRouter(prefix="/moderator", tags=["moderator"])

def check_moderator_role(current_user: User):
    """Check if the current user has moderator role"""
    if current_user.role != "moderator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only moderators can perform this action"
        )

@router.get("/products/pending", response_model=List[schemas.ProductRead])
def get_pending_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending products for the moderator's university"""
    # Check if user is a moderator
    check_moderator_role(current_user)
    
    # Get pending products for the moderator's university
    products = crud.get_pending_products(db, current_user.university_id, skip, limit)
    return products

@router.put("/products/{product_id}/accept", response_model=schemas.ProductRead)
def accept_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a product (moderator only)"""
    # Check if user is a moderator
    check_moderator_role(current_user)
    
    # Get and accept the product
    product = crud.accept_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product