from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from features.authentication.schemas import UserRead

class MessageBase(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class MessageRead(MessageBase):
    id: str
    chat_id: str
    sender_id: str
    created_at: datetime
    is_read: bool
    type: str
    sender: UserRead

    class Config:
        from_attributes = True

class ChatRoomBase(BaseModel):
    name: str
    is_group: bool
    participant_ids: List[str]

class ChatRoomCreate(ChatRoomBase):
    pass

class ChatRoomRead(ChatRoomBase):
    id: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    participants: List[UserRead]

    class Config:
        from_attributes = True

class WebSocketMessage(BaseModel):
    type: str  # 'message', 'typing', 'read'
    data: dict 