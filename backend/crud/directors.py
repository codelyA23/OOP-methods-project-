from sqlalchemy.orm import Session
from .. import models
from ..schemas import directors as director_schemas

def get_director(db: Session, director_id: int):
    return db.query(models.Director).filter(models.Director.id == director_id).first()

def get_directors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Director).offset(skip).limit(limit).all()

def create_director(db: Session, director: director_schemas.DirectorCreate):
    db_director = models.Director(**director.model_dump())
    db.add(db_director)
    db.commit()
    db.refresh(db_director)
    return db_director

def update_director(db: Session, director_id: int, director: director_schemas.DirectorCreate):
    db_director = get_director(db, director_id)
    if db_director:
        for key, value in director.model_dump(exclude_unset=True).items():
            setattr(db_director, key, value)
        db.commit()
        db.refresh(db_director)
    return db_director

def delete_director(db: Session, director_id: int):
    db_director = get_director(db, director_id)
    if db_director:
        db.delete(db_director)
        db.commit()
    return db_director
