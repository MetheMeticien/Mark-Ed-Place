from sqlalchemy.orm import Session
from . import models, schemas
import uuid
from typing import List, Optional
from features.authentication.models import User

# University CRUD operations
def create_university(db: Session, university: schemas.UniversityCreate):
    db_university = models.University(
        id=str(uuid.uuid4()),
        name=university.name,
        email=university.email
    )
    db.add(db_university)
    db.commit()
    db.refresh(db_university)
    return db_university

def get_university(db: Session, university_id: str):
    return db.query(models.University).filter(models.University.id == university_id).first()

def get_university_by_email(db: Session, email: str):
    return db.query(models.University).filter(models.University.email == email).first()

def get_all_universities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.University).offset(skip).limit(limit).all()

# Product CRUD operations
def create_product(db: Session, product: schemas.ProductCreate, seller_id: str):
    # Verify university exists
    university = get_university(db, product.university_id)
    if not university:
        raise ValueError("University not found")
        
    db_product = models.Product(
        id=str(uuid.uuid4()),
        seller_id=seller_id,
        **product.model_dump()
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product(db: Session, product_id: str):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    university_id: Optional[str] = None,
    current_user: Optional[User] = None
):
    query = db.query(models.Product)
    
    # Filter by university if specified
    if university_id:
        query = query.filter(models.Product.university_id == university_id)
    
    # Handle visibility
    if current_user:
        # If user is logged in, show all products from their university
        # plus products marked as visible to all
        query = query.filter(
            (models.Product.university_id == current_user.university_id) |
            (models.Product.visibility == models.ProductVisibility.ALL)
        )
    else:
        # If user is not logged in, only show products visible to all
        query = query.filter(models.Product.visibility == models.ProductVisibility.ALL)
    
    return query.offset(skip).limit(limit).all()

def update_product(db: Session, product_id: str, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product.model_dump(exclude_unset=True)
        
        # If university is being updated, verify it exists
        if 'university_id' in update_data:
            university = get_university(db, update_data['university_id'])
            if not university:
                raise ValueError("University not found")
        
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def get_seller_products(db: Session, seller_id: str):
    return db.query(models.Product).filter(models.Product.seller_id == seller_id).all() 

# Order CRUD operations
def create_order(db: Session, order: schemas.OrderCreate, buyer_id: str):
    # Verify product exists and has enough stock
    product = get_product(db, order.product_id)
    if not product:
        raise ValueError("Product not found")
    
    if product.stock < order.quantity:
        raise ValueError(f"Not enough stock available. Available: {product.stock}, Requested: {order.quantity}")
    
    # Create the order
    db_order = models.Order(
        id=str(uuid.uuid4()),
        buyer_id=buyer_id,
        **order.model_dump()
    )
    
    # Update product stock
    product.stock -= order.quantity
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_order(db: Session, order_id: str):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_buyer_orders(db: Session, buyer_id: str):
    return db.query(models.Order).filter(models.Order.buyer_id == buyer_id).all()

def get_seller_orders(db: Session, seller_id: str):
    return db.query(models.Order).filter(models.Order.seller_id == seller_id).all()

def update_order(db: Session, order_id: str, order: schemas.OrderUpdate):
    db_order = get_order(db, order_id)
    if db_order:
        # Get the current quantity
        current_quantity = db_order.quantity
        
        # Update the order with new data
        update_data = order.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_order, key, value)
        
        # If quantity changed, update product stock accordingly
        if 'quantity' in update_data and update_data['quantity'] != current_quantity:
            product = get_product(db, db_order.product_id)
            quantity_diff = current_quantity - update_data['quantity']
            
            # If increasing order quantity, check if enough stock
            if quantity_diff < 0 and abs(quantity_diff) > product.stock:
                raise ValueError(f"Not enough stock available. Available: {product.stock}, Additional needed: {abs(quantity_diff)}")
            
            # Update product stock
            product.stock += quantity_diff
        
        db.commit()
        db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: str):
    db_order = get_order(db, order_id)
    if db_order:
        # Restore product stock
        product = get_product(db, db_order.product_id)
        if product:
            product.stock += db_order.quantity
        
        db.delete(db_order)
        db.commit()
    return db_order