from datetime import timedelta
import config
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from features.authentication.models import User
from . import schemas, crud
from database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from features.authentication.awt_jwt import get_current_user, create_access_token
from features.authentication.schemas import Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserRead)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_phone_no(db, user.phone_no)
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    return crud.create_user(db, user)

@router.post("/login", response_model=schemas.UserRead)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return db_user


@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print("Received login request:")
    print("Username:", form_data.username)
    print("Password:", form_data.password)

    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.phone_no}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
    
