from datetime import datetime
from typing import List, Optional, Callable, Dict
from database import get_db
from firebase_config import db
import uuid
from features.authentication.schemas import UserRead
from features.authentication.models import User
from sqlalchemy.orm import Session

class ChatService:
    def __init__(self):
        self.chats_ref = db.child('chats')
        self.messages_ref = db.child('messages')
        self._subscribers: Dict[str, List[Callable]] = {}

    def _user_to_read(self, user: User) -> UserRead:
        """Convert a User model to UserRead schema"""
        return UserRead(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_no=user.phone_no,
            gender=user.gender,
            role=user.role,
            created_at=user.created_at.isoformat() if user.created_at else None,
            university=user.university
        )

    def _convert_datetime_to_iso(self, data: dict) -> dict:
        """Convert all datetime objects in a dict to ISO format strings"""
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, dict):
                data[key] = self._convert_datetime_to_iso(value)
            elif isinstance(value, list):
                data[key] = [self._convert_datetime_to_iso(item) if isinstance(item, dict) else item for item in value]
        return data

    def _notify_subscribers(self, chat_id: str, update: dict):
        """Notify all subscribers of a chat about an update"""
        if chat_id in self._subscribers:
            for callback in self._subscribers[chat_id]:
                try:
                    callback(update)
                except Exception as e:
                    print(f"Error notifying subscriber: {e}")

    async def create_chat_room(self, name: str, is_group: bool, participant_ids: List[str], current_user: User) -> dict:
        # Get user data for participants
        participants_data = []
        for user_id in participant_ids:
            # Get a new database session
            db = next(get_db())
            try:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    participants_data.append(self._user_to_read(user).dict())
            finally:
                db.close()

        chat_data = {
            'name': name,
            'is_group': is_group,
            'participant_ids': participant_ids,  # Store IDs separately
            'participants': participants_data,    # Store full user data
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'last_message': None,
            'last_message_time': None
        }
        
        # Convert all datetime objects to ISO format strings
        chat_data = self._convert_datetime_to_iso(chat_data)
        
        chat_ref = self.chats_ref.push(chat_data)
        chat_id = chat_ref.key
        
        # Notify subscribers about the new chat
        self._notify_subscribers(chat_id, {'id': chat_id, **chat_data})
        
        return {'id': chat_id, **chat_data}

    async def get_chat_room(self, chat_id: str, current_user: User) -> Optional[dict]:
        chat_data = self.chats_ref.child(chat_id).get()
        if chat_data:
            # Check if user is a participant
            if current_user.id not in chat_data.get('participant_ids', []):
                return None
                
            # Get full participant data
            participants_data = []
            for participant_id in chat_data.get('participant_ids', []):
                # Get a new database session
                db = next(get_db())
                try:
                    user = db.query(User).filter(User.id == participant_id).first()
                    if user:
                        participants_data.append(self._user_to_read(user).dict())
                finally:
                    db.close()
            chat_data['participants'] = participants_data
            
            return {'id': chat_id, **chat_data}
        return None

    async def get_user_chats(self, current_user: User) -> List[dict]:
        all_chats = self.chats_ref.get() or {}
        chat_list = []
        for chat_id, chat_data in all_chats.items():
            if current_user.id in chat_data.get('participant_ids', []):
                # Ensure we have the full participant data
                if 'participant_ids' in chat_data:
                    participants_data = []
                    for participant_id in chat_data['participant_ids']:
                        # Get a new database session
                        db = next(get_db())
                        try:
                            user = db.query(User).filter(User.id == participant_id).first()
                            if user:
                                participants_data.append(self._user_to_read(user).dict())
                        finally:
                            db.close()
                    chat_data['participants'] = participants_data
                chat_list.append({'id': chat_id, **chat_data})
        return chat_list

    async def send_message(self, chat_id: str, current_user: User, content: Optional[str] = None, image_url: Optional[str] = None) -> dict:
        message_data = {
            'chat_id': chat_id,
            'sender_id': current_user.id,
            'content': content,
            'created_at': datetime.now(),
            'is_read': False,
            'type': 'text' if content else 'image',
            'sender': self._user_to_read(current_user).dict()  # Include sender data
        }

        # Handle image URL if present
        if image_url:
            message_data['image_url'] = image_url
            message_data['type'] = 'image'

        # Convert all datetime objects to ISO format strings
        message_data = self._convert_datetime_to_iso(message_data)

        message_ref = self.messages_ref.push(message_data)
        message_id = message_ref.key
        
        # Update chat's last message and timestamp
        update_data = {
            'updated_at': datetime.now(),
            'last_message': content if content else 'Image',
            'last_message_time': datetime.now()
        }
        
        # Convert update data datetime objects to ISO format strings
        update_data = self._convert_datetime_to_iso(update_data)
        
        self.chats_ref.child(chat_id).update(update_data)
        
        # Notify subscribers about the new message
        self._notify_subscribers(chat_id, {'id': message_id, **message_data})

        return {'id': message_id, **message_data}

    async def get_chat_messages(self, chat_id: str, current_user: User, limit: int = 50) -> List[dict]:
        all_messages = self.messages_ref.get() or {}
        message_list = []
        for msg_id, msg_data in all_messages.items():
            if msg_data.get('chat_id') == chat_id:
                # Get sender data
                db = next(get_db())
                try:
                    sender = db.query(User).filter(User.id == msg_data['sender_id']).first()
                    if sender:
                        msg_data['sender'] = self._user_to_read(sender).dict()
                finally:
                    db.close()
                message_list.append({'id': msg_id, **msg_data})
        
        # Sort by created_at and limit
        message_list.sort(key=lambda x: x['created_at'], reverse=True)
        return message_list[:limit]

    async def mark_messages_as_read(self, chat_id: str, user_id: str):
        all_messages = self.messages_ref.get() or {}
        updates = {}
        for msg_id, msg_data in all_messages.items():
            if (msg_data.get('chat_id') == chat_id and 
                msg_data.get('sender_id') != user_id and 
                not msg_data.get('is_read', False)):
                updates[f'{msg_id}/is_read'] = True
        
        if updates:
            self.messages_ref.update(updates)

    def subscribe_to_chat(self, chat_id: str, callback: Callable):
        """Subscribe to real-time updates for a specific chat room"""
        if chat_id not in self._subscribers:
            self._subscribers[chat_id] = []
        self._subscribers[chat_id].append(callback)

    def subscribe_to_user_chats(self, user_id: str, callback: Callable):
        """Subscribe to real-time updates for all chats a user is part of"""
        # Get all chats for the user
        all_chats = self.chats_ref.get() or {}
        for chat_id, chat_data in all_chats.items():
            if user_id in chat_data.get('participant_ids', []):
                self.subscribe_to_chat(chat_id, callback)

    def unsubscribe_from_chat(self, chat_id: str, callback: Callable):
        """Unsubscribe from real-time updates for a specific chat room"""
        if chat_id in self._subscribers:
            self._subscribers[chat_id] = [cb for cb in self._subscribers[chat_id] if cb != callback]
            if not self._subscribers[chat_id]:
                del self._subscribers[chat_id]

    def unsubscribe_from_user_chats(self, user_id: str, callback: Callable):
        """Unsubscribe from real-time updates for all chats a user is part of"""
        all_chats = self.chats_ref.get() or {}
        for chat_id, chat_data in all_chats.items():
            if user_id in chat_data.get('participant_ids', []):
                self.unsubscribe_from_chat(chat_id, callback)

chat_service = ChatService()