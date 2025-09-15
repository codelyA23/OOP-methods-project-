from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas import seats as seat_schemas
from ..crud import seats as seat_crud
from ..database import get_db
from ..auth.dependencies import get_current_admin_user

router = APIRouter(
    prefix="/seats",
    tags=["seats"],
)

@router.post("/", response_model=seat_schemas.SeatResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin_user)])
def create_seat(seat: seat_schemas.SeatCreate, db: Session = Depends(get_db)):
    db_seat = seat_crud.get_seat(db, row_no=seat.row_no, seat_no=seat.seat_no)
    if db_seat:
        # Return existing seat instead of throwing error
        return db_seat
    return seat_crud.create_seat(db=db, seat=seat)

@router.get("/", response_model=List[seat_schemas.SeatResponse])
def read_seats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    seats = seat_crud.get_seats(db, skip=skip, limit=limit)
    return seats

@router.put("/{row_no}/{seat_no}", response_model=seat_schemas.SeatResponse, dependencies=[Depends(get_current_admin_user)])
def update_seat(row_no: int, seat_no: int, seat_update: seat_schemas.SeatCreate, db: Session = Depends(get_db)):
    # Check if the seat exists
    db_seat = seat_crud.get_seat(db, row_no=row_no, seat_no=seat_no)
    if not db_seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    
    # Check if the new seat location already exists (if changing row or seat number)
    if (seat_update.row_no != row_no or seat_update.seat_no != seat_no):
        existing_seat = seat_crud.get_seat(db, row_no=seat_update.row_no, seat_no=seat_update.seat_no)
        if existing_seat:
            raise HTTPException(status_code=400, detail="Seat already exists at the new location")
    
    # Update the seat
    updated_seat = seat_crud.update_seat(db, row_no=row_no, seat_no=seat_no, seat_update=seat_update)
    if not updated_seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    
    return updated_seat

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin_user)])
def delete_seat(seat_to_delete: seat_schemas.SeatDelete, db: Session = Depends(get_db)):
    db_seat = seat_crud.delete_seat(db, row_no=seat_to_delete.row_no, seat_no=seat_to_delete.seat_no)
    if db_seat is None:
        raise HTTPException(status_code=404, detail="Seat not found")
    return

@router.delete("/all", status_code=status.HTTP_200_OK, dependencies=[Depends(get_current_admin_user)])
def delete_all_seats(db: Session = Depends(get_db)):
    deleted_count = seat_crud.delete_all_seats(db)
    return {"message": f"Successfully deleted {deleted_count} seats"}
