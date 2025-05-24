from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from features.authentication.schemas import UserRead

class MessageBase(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None

class MessageCreate(MessageBase):
    chat_room_id: str

class MessageRead(MessageBase):
    id: str
    sender_id: str
    chat_room_id: str
    created_at: datetime
    is_read: bool
    sender: UserRead

    class Config:
        from_attributes = True

class ChatRoomBase(BaseModel):
    name: Optional[str] = None
    is_group: bool = False

class ChatRoomCreate(ChatRoomBase):
    participant_ids: List[str]

class ChatRoomRead(ChatRoomBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime]
    participants: List[UserRead]
    last_message: Optional[MessageRead] = None

    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str  # 'message', 'typing', 'read'
    data: dict 