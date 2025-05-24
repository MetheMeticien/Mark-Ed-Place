from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
import enum
from typing import Optional

class MeetupStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Meetup(Base):
    __tablename__ = 'meetups'

    id = Column(String, primary_key=True, index=True)
    buyer_id = Column(String, ForeignKey('users.id'), nullable=False)
    seller_id = Column(String, ForeignKey('users.id'), nullable=False)
    product_id = Column(String, ForeignKey('products.id'), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(MeetupStatus), default=MeetupStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], backref="buyer_meetups")
    seller = relationship("User", foreign_keys=[seller_id], backref="seller_meetups")
    product = relationship("Product", backref="meetups")
