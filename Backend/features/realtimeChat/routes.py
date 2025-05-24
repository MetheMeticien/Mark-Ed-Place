from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from features.authentication.auth_jwt import get_current_user
from features.authentication.models import User
from . import schemas
from .chat_service import chat_service
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/rooms", response_model=schemas.ChatRoomRead)
async def create_chat_room(
    chat_room: schemas.ChatRoomCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Ensure current user is in participants
    if current_user.id not in chat_room.participant_ids:
        chat_room.participant_ids.append(current_user.id)
    
    return await chat_service.create_chat_room(
        name=chat_room.name,
        is_group=chat_room.is_group,
        participant_ids=chat_room.participant_ids,
        current_user=current_user
    )

@router.get("/rooms", response_model=List[schemas.ChatRoomRead])
async def get_user_chat_rooms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await chat_service.get_user_chats(current_user)

@router.get("/rooms/{chat_id}", response_model=schemas.ChatRoomRead)
async def get_chat_room(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = await chat_service.get_chat_room(chat_id, current_user)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat room not found")
    return chat

@router.post("/rooms/{chat_id}/messages", response_model=schemas.MessageRead)
async def send_message(
    chat_id: str,
    message: schemas.MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = await chat_service.get_chat_room(chat_id, current_user)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat room not found")

    return await chat_service.send_message(
        chat_id=chat_id,
        current_user=current_user,
        content=message.content,
        image_url=message.image_url
    )

@router.get("/rooms/{chat_id}/messages", response_model=List[schemas.MessageRead])
async def get_chat_messages(
    chat_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = await chat_service.get_chat_room(chat_id, current_user)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat room not found")

    messages = await chat_service.get_chat_messages(chat_id, current_user, limit)
    await chat_service.mark_messages_as_read(chat_id, current_user.id)
    return messages

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await websocket.accept()
    
    def message_callback(message):
        websocket.send_json(message)
    
    # Subscribe to real-time updates for this chat
    chat_service.subscribe_to_chat(chat_id, message_callback)
    
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Clean up subscription when client disconnects
        pass

@router.websocket("/ws/user/{user_id}")
async def user_websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    def chat_update_callback(chat_update):
        websocket.send_json(chat_update)
    
    # Subscribe to real-time updates for all user's chats
    chat_service.subscribe_to_user_chats(user_id, chat_update_callback)
    
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        # Clean up subscription when client disconnects
        pass 