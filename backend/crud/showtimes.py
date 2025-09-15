from sqlalchemy.orm import Session
from .. import models
from ..schemas import showtimes as showtime_schemas
from datetime import datetime

def get_showtime(db: Session, play_id: int, date_and_time: datetime):
    return db.query(models.ShowTime).filter(
        models.ShowTime.play_id == play_id,
        models.ShowTime.date_and_time == date_and_time
    ).first()

def get_all_showtimes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ShowTime).offset(skip).limit(limit).all()

def get_showtimes_for_play(db: Session, play_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ShowTime).filter(models.ShowTime.play_id == play_id).offset(skip).limit(limit).all()

def create_showtime(db: Session, showtime: showtime_schemas.ShowTimeCreate):
    db_showtime = models.ShowTime(**showtime.model_dump())
    db.add(db_showtime)
    db.commit()
    db.refresh(db_showtime)
    return db_showtime

def delete_showtime(db: Session, play_id: int, date_and_time: datetime):
    db_showtime = get_showtime(db, play_id=play_id, date_and_time=date_and_time)
    if db_showtime:
        db.delete(db_showtime)
        db.commit()
    return db_showtime

def update_showtime(
    db: Session, 
    play_id: int, 
    original_date_time: datetime, 
    showtime_update: dict
):
    # Get the existing showtime
    db_showtime = get_showtime(db, play_id=play_id, date_and_time=original_date_time)
    if not db_showtime:
        return None
        
    # Update the fields
    for field, value in showtime_update.items():
        setattr(db_showtime, field, value)
    
    db.commit()
    db.refresh(db_showtime)
    return db_showtime
