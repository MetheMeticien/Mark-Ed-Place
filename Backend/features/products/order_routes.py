from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from features.authentication.models import User
from features.authentication.auth_jwt import get_current_user
from database import get_db
from . import schemas, crud, models

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.OrderRead)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order"""
    try:
        # Verify that the buyer is not the seller
        if order.seller_id == current_user.id:
            raise HTTPException(
                status_code=400,
                detail="You cannot order your own product"
            )
        
        return crud.create_order(db, order, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.OrderRead])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all orders (admin only)"""
    # TODO: Add admin check here
    return crud.get_orders(db, skip, limit)

@router.get("/me/purchases", response_model=List[schemas.OrderRead])
def get_my_purchases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all orders made by the current user"""
    return crud.get_buyer_orders(db, current_user.id)

@router.get("/me/sales", response_model=List[schemas.OrderRead])
def get_my_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all orders for products sold by the current user"""
    return crud.get_seller_orders(db, current_user.id)

@router.get("/{order_id}", response_model=schemas.OrderRead)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific order"""
    order = crud.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if the user is the buyer or seller of this order
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this order"
        )
    
    return order

@router.put("/{order_id}", response_model=schemas.OrderRead)
def update_order(
    order_id: str,
    order: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an order (only quantity can be updated)"""
    db_order = crud.get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Only the buyer can update their order
    if db_order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this order"
        )
    
    try:
        return crud.update_order(db, order_id, order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{order_id}")
def delete_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel an order"""
    db_order = crud.get_order(db, order_id)
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Only the buyer can cancel their order
    if db_order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to cancel this order"
        )
    
    crud.delete_order(db, order_id)
    return {"message": "Order cancelled successfully"}
