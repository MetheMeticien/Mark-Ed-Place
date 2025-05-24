from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import MeetupStatus

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
