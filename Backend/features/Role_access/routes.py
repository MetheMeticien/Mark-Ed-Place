from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from features.authentication.models import User, Role
from features.authentication.schemas import UserRead
from features.authentication.crud import get_all_users, get_user_by_id
from database import get_db
from features.Role_access.crud import update_user_role
from features.authentication.auth_jwt import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserRead])
async def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Get all users (admin only)"""
    return get_all_users(db)

@router.put("/users/{user_id}/role")
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