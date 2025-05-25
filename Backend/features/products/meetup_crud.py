from sqlalchemy.orm import Session
from . import models, schemas
import uuid
from typing import List, Optional
from features.authentication.models import User
from features.products.crud import get_product

# Meetup CRUD operations
def create_meetup(db: Session, meetup: schemas.MeetupCreate, buyer_id: str):
    # Verify product exists
    product = get_product(db, meetup.product_id)
    if not product:
        raise ValueError("Product not found")
    
    # Verify seller exists and is the owner of the product
    if product.seller_id != meetup.seller_id:
        raise ValueError("Seller is not the owner of the product")
    
    db_meetup = models.Meetup(
        id=str(uuid.uuid4()),
        buyer_id=buyer_id,
        seller_id=meetup.seller_id,
        product_id=meetup.product_id,
        latitude=meetup.latitude,
        longitude=meetup.longitude,
        status=models.MeetupStatus.PENDING
    )
    
    db.add(db_meetup)
    db.commit()
    db.refresh(db_meetup)
    return db_meetup

def get_meetup(db: Session, meetup_id: str):
    return db.query(models.Meetup).filter(models.Meetup.id == meetup_id).first()

def get_meetups(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Meetup).offset(skip).limit(limit).all()

def get_buyer_meetups(db: Session, buyer_id: str):
    return db.query(models.Meetup).filter(models.Meetup.buyer_id == buyer_id).all()

def get_seller_meetups(db: Session, seller_id: str):
    return db.query(models.Meetup).filter(models.Meetup.seller_id == seller_id).all()

def get_product_meetups(db: Session, product_id: str):
    return db.query(models.Meetup).filter(models.Meetup.product_id == product_id).all()

def update_meetup_status(db: Session, meetup_id: str, status: models.MeetupStatus):
    db_meetup = get_meetup(db, meetup_id)
    if db_meetup:
        db_meetup.status = status
        db.commit()
        db.refresh(db_meetup)
    return db_meetup

def delete_meetup(db: Session, meetup_id: str):
    db_meetup = get_meetup(db, meetup_id)
    if db_meetup:
        db.delete(db_meetup)
        db.commit()
    return db_meetup
