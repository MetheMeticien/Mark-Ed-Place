from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import RequestStatus
from features.authentication.schemas import UserRead

class ModeratorRequestBase(BaseModel):
    reason: str

class ModeratorRequestCreate(ModeratorRequestBase):
    pass

class ModeratorRequestUpdate(BaseModel):
    status: RequestStatus

class ModeratorRequestRead(ModeratorRequestBase):
    id: str
    user_id: str
    status: RequestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: UserRead

    class Config:
        from_attributes = True 