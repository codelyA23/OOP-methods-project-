from sqlalchemy.orm import Session
from .. import models
from ..schemas import showtime_prices as stp_schemas
from datetime import datetime

def get_showtime_price(db: Session, row_no: int, seat_no: int, showtime_date_and_time: datetime, showtime_play_id: int):
    return db.query(models.ShowTimePrice).filter(
        models.ShowTimePrice.row_no == row_no,
        models.ShowTimePrice.seat_no == seat_no,
        models.ShowTimePrice.showtime_date_and_time == showtime_date_and_time,
        models.ShowTimePrice.showtime_play_id == showtime_play_id
    ).first()

def get_prices_for_showtime(db: Session, showtime_date_and_time: datetime, showtime_play_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.ShowTimePrice).filter(
        models.ShowTimePrice.showtime_date_and_time == showtime_date_and_time,
        models.ShowTimePrice.showtime_play_id == showtime_play_id
    ).offset(skip).limit(limit).all()

def create_showtime_price(db: Session, price: stp_schemas.ShowTimePriceCreate):
    db_price = models.ShowTimePrice(**price.model_dump())
    db.add(db_price)
    db.commit()
    db.refresh(db_price)
    return db_price

def update_showtime_price(db: Session, row_no: int, seat_no: int, showtime_date_and_time: datetime, showtime_play_id: int, price_update: stp_schemas.ShowTimePriceUpdate):
    db_price = get_showtime_price(db, row_no, seat_no, showtime_date_and_time, showtime_play_id)
    if db_price:
        db_price.price = price_update.price
        db.commit()
        db.refresh(db_price)
    return db_price

def delete_showtime_price(db: Session, row_no: int, seat_no: int, showtime_date_and_time: datetime, showtime_play_id: int):
    db_price = get_showtime_price(db, row_no, seat_no, showtime_date_and_time, showtime_play_id)
    if db_price:
        db.delete(db_price)
        db.commit()
    return db_price
