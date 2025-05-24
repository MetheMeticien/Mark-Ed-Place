from features.Role_access.models import RequestStatus
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from features.authentication.models import User, Role
from features.authentication.schemas import UserRead
from features.authentication.crud import get_all_users, get_user_by_id
from database import get_db
from features.Role_access.crud import update_user_role, create_moderator_request, get_moderator_request, get_user_moderator_request, get_all_moderator_requests, update_moderator_request_status
from features.Role_access.schemas import ModeratorRequestCreate, ModeratorRequestRead, ModeratorRequestUpdate
from features.authentication.auth_jwt import get_admin_user, get_current_user


user_role_router = APIRouter(prefix="/admin", tags=["admin"])

@user_role_router.get("/users", response_model=List[UserRead])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get all users (admin only)"""
    return get_all_users(db)

@user_role_router.put("/users/{user_id}/role")
async def update_role(
    user_id: str,
    role: Role,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Update user role (admin only)"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from changing their own role
    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change your own role"
        )
    
    updated_user = update_user_role(db, user_id, role)
    return {"message": f"User role updated to {role.value}"}

moderator_request_router = APIRouter(prefix="/moderator-requests", tags=["moderator-requests"])

@moderator_request_router.post("/", response_model=ModeratorRequestRead)
def request_moderator_role(
    request: ModeratorRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new moderator request"""
    # Check if user already has a pending request
    existing_request = get_user_moderator_request(db, current_user.id)
    if existing_request:
        raise HTTPException(
            status_code=400,
            detail="You already have a pending moderator request"
        )
    
    return create_moderator_request(db, current_user.id, request)

@moderator_request_router.get("/", response_model=List[ModeratorRequestRead])
async def get_all_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get all moderator requests (admin only)"""
    return get_all_moderator_requests(db)

@moderator_request_router.put("/{request_id}", response_model=ModeratorRequestRead)
async def update_request_status(
    request_id: str,
    status_update: ModeratorRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Update moderator request status (admin only)"""
    request = get_moderator_request(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.status != RequestStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Can only update pending requests"
        )
    
    updated_request = update_moderator_request_status(db, request_id, status_update.status)
    
    # If approved, update user role to moderator
    if status_update.status == RequestStatus.APPROVED:
        update_user_role(db, request.user_id, Role.MODERATOR)
    
    return updated_request 