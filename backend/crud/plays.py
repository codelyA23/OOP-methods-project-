from sqlalchemy.orm import Session
from .. import models
from ..schemas import plays as play_schemas

# Create
def create_play(db: Session, play: play_schemas.PlayCreate):
    db_play = models.Play(**play.model_dump())
    db.add(db_play)
    db.commit()
    db.refresh(db_play)
    return db_play

# Read All
def get_all_plays(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Play).offset(skip).limit(limit).all()

# Read by ID
def get_play(db: Session, play_id: int):
    return db.query(models.Play).filter(models.Play.id == play_id).first()

# Update
def update_play(db: Session, play_id: int, play_data: play_schemas.PlayUpdate):
    db_play = get_play(db, play_id)
    if not db_play:
        return None
    
    update_data = play_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_play, key, value)
        
    db.commit()
    db.refresh(db_play)
    return db_play

# Delete
def delete_play(db: Session, play_id: int):
    db_play = get_play(db, play_id)
    if db_play:
        db.delete(db_play)
        db.commit()
    return db_play
