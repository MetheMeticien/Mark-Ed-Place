from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from .models import ProductVisibility, ProductStatus, MeetupStatus

class UniversityBase(BaseModel):
    name: str
    email: str
    latitude: float
    longitude: float

class UniversityCreate(UniversityBase):
    pass

class UniversityRead(UniversityBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    latitude: float
    longitude: float

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
    status: ProductStatus = ProductStatus.PENDING
    image: Optional[list[str]] = None
    stock: int
    avg_rating: Optional[float] = None
    num_of_ratings: Optional[int] = None

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
    status: Optional[ProductStatus] = None
    image: Optional[list[str]] = None
    stock: Optional[int] = None
    avg_rating: Optional[float] = None
    num_of_ratings: Optional[int] = None

class ProductRead(ProductBase):
    id: str
    seller_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    university: UniversityRead
    stock: int
    avg_rating: Optional[float] = None
    num_of_ratings: Optional[int] = None
    image: Optional[list[str]] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    product_id: str
    quantity: int
    seller_id: str

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    quantity: Optional[int] = None

class OrderRead(OrderBase):
    id: str
    buyer_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    product: Optional[ProductRead] = None

    class Config:
        from_attributes = True

class MeetupBase(BaseModel):
    product_id: str
    latitude: float
    longitude: float

class MeetupCreate(MeetupBase):
    seller_id: str

class MeetupUpdate(BaseModel):
    status: Optional[MeetupStatus] = None

class MeetupRead(MeetupBase):
    id: str
    buyer_id: str
    seller_id: str
    status: MeetupStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
