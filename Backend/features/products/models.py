from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum

class ProductVisibility(str, enum.Enum):
    ALL = "all"
    UNIVERSITY_ONLY = "university_only"

class University(Base):
    __tablename__ = 'universities'

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    products = relationship("Product", back_populates="university")
    users = relationship("User", back_populates="university")

class Product(Base):
    __tablename__ = 'products'

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    seller_id = Column(String, ForeignKey('users.id'), nullable=False)
    category = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    location = Column(String, nullable=False)
    university_id = Column(String, ForeignKey('universities.id'), nullable=False)
    visibility = Column(Enum(ProductVisibility), default=ProductVisibility.ALL, nullable=False)
    image = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    seller = relationship("User", back_populates="products")
    university = relationship("University", back_populates="products")