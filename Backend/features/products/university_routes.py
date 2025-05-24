from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from features.authentication.models import User
from features.authentication.auth_jwt import get_admin_user
from database import get_db
from . import schemas, crud

router = APIRouter(prefix="/universities", tags=["universities"])

@router.post("/", response_model=schemas.UniversityRead)
def create_university(
    university: schemas.UniversityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Create a new university (admin only)"""
    # Check if university with same email already exists
    existing = crud.get_university_by_email(db, university.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="University with this email already exists"
        )
    return crud.create_university(db, university)

@router.get("/", response_model=List[schemas.UniversityRead])
def get_universities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all universities"""
    return crud.get_all_universities(db, skip, limit)

@router.get("/{university_id}", response_model=schemas.UniversityRead)
def get_university(
    university_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific university"""
    university = crud.get_university(db, university_id)
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    return university

@router.put("/{university_id}", response_model=schemas.UniversityRead)
def update_university(
    university_id: str,
    university: schemas.UniversityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Update a university (admin only)"""
    db_university = crud.get_university(db, university_id)
    if not db_university:
        raise HTTPException(status_code=404, detail="University not found")
    
    # Check if new email is already taken by another university
    if university.email != db_university.email:
        existing = crud.get_university_by_email(db, university.email)
        if existing:
            raise HTTPException(
                status_code=400,
                detail="University with this email already exists"
            )
    
    # Update university
    db_university.name = university.name
    db_university.email = university.email
    db.commit()
    db.refresh(db_university)
    return db_university

@router.delete("/{university_id}")
def delete_university(
    university_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    """Delete a university (admin only)"""
    db_university = crud.get_university(db, university_id)
    if not db_university:
        raise HTTPException(status_code=404, detail="University not found")
    
    # Check if university has any associated products or users
    if db_university.products or db_university.users:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete university with associated products or users"
        )
    
    db.delete(db_university)
    db.commit()
    return {"message": "University deleted successfully"}