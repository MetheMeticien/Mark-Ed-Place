from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .models import ProductVisibility


class UniversityBase(BaseModel):
    name: str
    email: str

class UniversityCreate(UniversityBase):
    pass

class UniversityRead(UniversityBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    category: str
    condition: str
    location: str
    university_id: str
    visibility: ProductVisibility = ProductVisibility.ALL
    image: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    university_id: Optional[str] = None
    visibility: Optional[ProductVisibility] = None
    image: Optional[str] = None

class ProductRead(ProductBase):
    id: str
    seller_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    university: UniversityRead

    class Config:
        from_attributes = True