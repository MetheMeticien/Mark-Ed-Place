from typing import Dict, Set
from fastapi import WebSocket
import json
from .schemas import WebSocketMessage

class ConnectionManager:
    def __init__(self):
        # Store active connections: {user_id: {chat_room_id: WebSocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str, chat_room_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = {}
        self.active_connections[user_id][chat_room_id] = websocket

    def disconnect(self, user_id: str, chat_room_id: str):
        if user_id in self.active_connections:
            if chat_room_id in self.active_connections[user_id]:
                del self.active_connections[user_id][chat_room_id]
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: WebSocketMessage, user_id: str, chat_room_id: str):
        if user_id in self.active_connections and chat_room_id in self.active_connections[user_id]:
            await self.active_connections[user_id][chat_room_id].send_json(message.dict())

    async def broadcast_to_chat_room(self, message: WebSocketMessage, chat_room_id: str, exclude_user_id: str = None):
        for user_id, connections in self.active_connections.items():
            if chat_room_id in connections and user_id != exclude_user_id:
                await connections[chat_room_id].send_json(message.dict())

manager = ConnectionManager() 