from sqlalchemy.orm import Session
from .. import models
from ..schemas import users as user_schemas
from ..auth.security import get_password_hash

def get_user_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()



def create_user(db: Session, user: user_schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.Customer(
        name=user.name,
        email=user.email, 
        hashed_password=hashed_password,
        telephone_no=user.telephone_no,
        role="customer"  # Default role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


