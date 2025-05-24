from sqlalchemy import Column, String, Boolean, DateTime, Float, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum


class Role(str, enum.Enum):
    ADMIN = "admin"
    MODERATOR = "moderator"
    NORMAL = "normal"


class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True)
    phone_no = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    gender = Column(String, nullable=True)
    role = Column(Enum(Role), default=Role.NORMAL, nullable=False)
    #university_id = Column(String, ForeignKey('universities.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    
    # Relationship with ModeratorRequest
    moderator_requests = relationship("ModeratorRequest", back_populates="user")
    # Relationships
    products = relationship("Product", back_populates="seller")
    #university = relationship("University", back_populates="users")
