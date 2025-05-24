from features.authentication.models import User, Role
from features.Role_access.models import ModeratorRequest, RequestStatus
from features.Role_access.schemas import ModeratorRequestCreate
from features.authentication.crud import get_user_by_id
from sqlalchemy.orm import Session
import uuid


def update_user_role(db: Session, user_id: str, role: Role):
    user = get_user_by_id(db, user_id)
    if user:
        user.role = role
        db.commit()
        db.refresh(user)
    return user

def create_moderator_request(db: Session, user_id: str, request: ModeratorRequestCreate):
    db_request = ModeratorRequest(
        id=str(uuid.uuid4()),
        user_id=user_id,
        reason=request.reason
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

def get_moderator_request(db: Session, request_id: str):
    return db.query(ModeratorRequest).filter(ModeratorRequest.id == request_id).first()

def get_user_moderator_request(db: Session, user_id: str):
    return db.query(ModeratorRequest).filter(ModeratorRequest.user_id == user_id).first()

def get_all_moderator_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ModeratorRequest).offset(skip).limit(limit).all()

def update_moderator_request_status(db: Session, request_id: str, status: RequestStatus):
    request = get_moderator_request(db, request_id)
    if request:
        request.status = status
        db.commit()
        db.refresh(request)
    return request