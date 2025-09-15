from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models
from ..schemas import showtimes as showtime_schemas
from ..crud import showtimes as showtime_crud
from ..database import get_db
from ..auth.dependencies import get_current_admin_user

router = APIRouter(
    prefix="/showtimes",
    tags=["showtimes"],
)

@router.post("/", response_model=showtime_schemas.ShowTimeResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user)])
def create_showtime(showtime: showtime_schemas.ShowTimeCreate, db: Session = Depends(get_db)):
    db_play = db.query(models.Play).filter(models.Play.id == showtime.play_id).first()
    if not db_play:
        raise HTTPException(status_code=404, detail=f"Play with id {showtime.play_id} not found")
    
    db_showtime = showtime_crud.get_showtime(db, play_id=showtime.play_id, date_and_time=showtime.date_and_time)
    if db_showtime:
        raise HTTPException(status_code=400, detail="This showtime already exists for the given play.")
        
    return showtime_crud.create_showtime(db=db, showtime=showtime)

@router.get("/", response_model=List[showtime_schemas.ShowTimeResponse])
def read_all_showtimes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    showtimes = showtime_crud.get_all_showtimes(db, skip=skip, limit=limit)
    return showtimes

@router.get("/{play_id}", response_model=List[showtime_schemas.ShowTimeResponse])
def read_showtimes_for_play(play_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    showtimes = showtime_crud.get_showtimes_for_play(db, play_id=play_id, skip=skip, limit=limit)
    return showtimes

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
def delete_showtime(showtime_to_delete: showtime_schemas.ShowTimeDelete, db: Session = Depends(get_db)):
    db_showtime = showtime_crud.delete_showtime(db, play_id=showtime_to_delete.play_id, date_and_time=showtime_to_delete.date_and_time)
    if db_showtime is None:
        raise HTTPException(status_code=404, detail="Showtime not found")
    return

@router.get("/{play_id}/{date_and_time}/available-seats")
def get_available_seats(play_id: int, date_and_time: str, db: Session = Depends(get_db)):
    # Parse date_and_time
    try:
        dt = datetime.fromisoformat(date_and_time)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")
    
    # Get all seats from the seats table
    all_seats = db.query(models.Seat).all()
    
    # Get booked seats for this showtime
    booked = db.query(models.Ticket).filter(
        models.Ticket.showtime_play_id == play_id,
        models.Ticket.showtime_date_and_time == dt
    ).all()
    booked_set = {(t.row_no, t.seat_no) for t in booked}
    
    # Return all seats with booking status
    seats_with_status = []
    for seat in all_seats:
        is_booked = (seat.row_no, seat.seat_no) in booked_set
        seats_with_status.append({
            "row_no": seat.row_no,
            "seat_no": seat.seat_no,
            "is_booked": is_booked
        })
    
    return seats_with_status
