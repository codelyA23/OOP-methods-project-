from sqlalchemy.orm import Session
from .. import models
from ..schemas import seats as seat_schemas

def get_seat(db: Session, row_no: int, seat_no: int):
    return db.query(models.Seat).filter(
        models.Seat.row_no == row_no,
        models.Seat.seat_no == seat_no
    ).first()

def get_seats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Seat).offset(skip).limit(limit).all()

def create_seat(db: Session, seat: seat_schemas.SeatCreate):
    db_seat = models.Seat(**seat.model_dump())
    db.add(db_seat)
    db.commit()
    db.refresh(db_seat)
    return db_seat

def update_seat(db: Session, row_no: int, seat_no: int, seat_update: seat_schemas.SeatCreate):
    db_seat = get_seat(db, row_no=row_no, seat_no=seat_no)
    if not db_seat:
        return None
    
    # Update the seat attributes
    for field, value in seat_update.model_dump().items():
        setattr(db_seat, field, value)
    
    db.commit()
    db.refresh(db_seat)
    return db_seat

def delete_seat(db: Session, row_no: int, seat_no: int):
    db_seat = get_seat(db, row_no=row_no, seat_no=seat_no)
    if db_seat:
        db.delete(db_seat)
        db.commit()
    return db_seat

def delete_all_seats(db: Session):
    deleted_count = db.query(models.Seat).count()
    db.query(models.Seat).delete()
    db.commit()
    return deleted_count
