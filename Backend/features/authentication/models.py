from sqlalchemy import Column, String, Boolean, DateTime, Float, Enum
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
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
