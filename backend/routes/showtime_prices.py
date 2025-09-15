from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models
from ..schemas import showtime_prices as stp_schemas
from ..crud import showtime_prices as stp_crud
from ..database import get_db
from ..auth.dependencies import get_current_admin_user

router = APIRouter(
    prefix="/showtime-prices",
    tags=["showtime_prices"],
)

@router.post("/", response_model=stp_schemas.ShowTimePriceResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user)])
def create_showtime_price(price: stp_schemas.ShowTimePriceCreate, db: Session = Depends(get_db)):
    # Check if the referenced showtime and seat exist
    db_showtime = db.query(models.ShowTime).filter(models.ShowTime.play_id == price.showtime_play_id, models.ShowTime.date_and_time == price.showtime_date_and_time).first()
    if not db_showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")
    db_seat = db.query(models.Seat).filter(models.Seat.row_no == price.row_no, models.Seat.seat_no == price.seat_no).first()
    if not db_seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    db_price = stp_crud.get_showtime_price(db, **price.model_dump())
    if db_price:
        raise HTTPException(status_code=400, detail="Price for this seat at this showtime already exists")

    return stp_crud.create_showtime_price(db=db, price=price)

@router.get("/{play_id}/{date_and_time}", response_model=List[stp_schemas.ShowTimePriceResponse])
def read_prices_for_showtime(play_id: int, date_and_time: datetime, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prices = stp_crud.get_prices_for_showtime(db, showtime_play_id=play_id, showtime_date_and_time=date_and_time, skip=skip, limit=limit)
    return prices

@router.put("/", response_model=stp_schemas.ShowTimePriceResponse, dependencies=[Depends(get_current_admin_user)])
def update_showtime_price(price_info: stp_schemas.ShowTimePriceCreate, db: Session = Depends(get_db)):
    db_price = stp_crud.update_showtime_price(
        db, 
        row_no=price_info.row_no, 
        seat_no=price_info.seat_no, 
        showtime_date_and_time=price_info.showtime_date_and_time, 
        showtime_play_id=price_info.showtime_play_id,
        price_update=price_info
    )
    if db_price is None:
        raise HTTPException(status_code=404, detail="Showtime price not found")
    return db_price

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
def delete_showtime_price(price_to_delete: stp_schemas.ShowTimePriceBase, db: Session = Depends(get_db)):
    db_price = stp_crud.delete_showtime_price(
        db, 
        row_no=price_to_delete.row_no, 
        seat_no=price_to_delete.seat_no, 
        showtime_date_and_time=price_to_delete.showtime_date_and_time, 
        showtime_play_id=price_to_delete.showtime_play_id
    )
    if db_price is None:
        raise HTTPException(status_code=404, detail="Showtime price not found")
    return
