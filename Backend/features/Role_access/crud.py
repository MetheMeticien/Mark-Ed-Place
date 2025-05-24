from features.authentication import models, schemas
from features.authentication.crud import get_user_by_id
from sqlalchemy.orm import Session


def update_user_role(db: Session, user_id: str, role: models.Role):
    user = get_user_by_id(db, user_id)
    if user:
        user.role = role
        db.commit()
        db.refresh(user)
    return user