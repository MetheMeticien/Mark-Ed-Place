from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_phone_no(db: Session, phone_no: str):
    return db.query(models.User).filter(models.User.phone_no == phone_no).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: str):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        id=str(uuid.uuid4()),
        phone_no=user.phone_no,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        gender=user.gender,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not pwd_context.verify(password, user.hashed_password):
        return None
    return user


def update_user_role(db: Session, user_id: str, role: models.Role):
    user = get_user_by_id(db, user_id)
    if user:
        user.role = role
        db.commit()
        db.refresh(user)
    return user

def get_all_users(db: Session):
    """Get all users from the database"""
    return db.query(models.User).all()