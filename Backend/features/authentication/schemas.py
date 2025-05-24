from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from features.authentication.models import Role
from features.products.schemas import UniversityRead

class UserBase(BaseModel):
    phone_no: str
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    role: Optional[Role] = Role.NORMAL

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: str
    role: Role
    created_at: datetime
    university: UniversityRead

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None