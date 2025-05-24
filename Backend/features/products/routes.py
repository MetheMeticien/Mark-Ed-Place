from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from features.authentication.models import User
from features.authentication.auth_jwt import get_current_user
from database import get_db
from . import schemas, crud, models

router = APIRouter(prefix="/products", tags=["products"])

@router.post("/", response_model=schemas.ProductRead)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new product"""
    try:
        return crud.create_product(db, product, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.ProductRead])
def get_products(
    university_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all products with university and visibility filtering"""
    return crud.get_products(db, skip, limit, university_id, current_user)

@router.get("/{product_id}", response_model=schemas.ProductRead)
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get a specific product"""
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check visibility
    if product.visibility == models.ProductVisibility.UNIVERSITY_ONLY:
        if not current_user or current_user.university_id != product.university_id:
            raise HTTPException(
                status_code=403,
                detail="This product is only visible to users from the same university"
            )
    
    return product

@router.put("/{product_id}", response_model=schemas.ProductRead)
def update_product(
    product_id: str,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a product"""
    db_product = crud.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if db_product.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this product"
        )
    
    try:
        return crud.update_product(db, product_id, product)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a product"""
    db_product = crud.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if db_product.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this product"
        )
    
    crud.delete_product(db, product_id)
    return {"message": "Product deleted successfully"} 

@router.get("/seller/{seller_id}", response_model=List[schemas.ProductRead])
def get_products_by_seller(
    seller_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get all products from a specific seller"""
    products = crud.get_seller_products(db, seller_id)
    
    # Filter products based on visibility and user's university
    if current_user:
        # If user is logged in, show all products from their university plus products marked as visible to all
        visible_products = [
            p for p in products if 
            p.visibility == models.ProductVisibility.ALL or 
            (p.visibility == models.ProductVisibility.UNIVERSITY_ONLY and p.university_id == current_user.university_id)
        ]
    else:
        # If user is not logged in, only show products visible to all
        visible_products = [p for p in products if p.visibility == models.ProductVisibility.ALL]
    
    return visible_products