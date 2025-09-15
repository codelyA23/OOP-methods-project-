from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas import tickets as ticket_schemas
from ..crud import tickets as ticket_crud
from ..database import get_db
from ..auth.dependencies import get_current_user

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
    dependencies=[Depends(get_current_user)]  # Protect all ticket routes
)

@router.post("/", response_model=ticket_schemas.TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: ticket_schemas.TicketCreate, db: Session = Depends(get_db), current_user: models.Customer = Depends(get_current_user)):
    # Validate that the seat exists
    db_seat = db.query(models.Seat).filter(
        models.Seat.row_no == ticket.row_no,
        models.Seat.seat_no == ticket.seat_no
    ).first()
    if not db_seat:
        raise HTTPException(status_code=404, detail=f"Seat Row {ticket.row_no}, Seat {ticket.seat_no} does not exist")
    
    # Validate that the showtime exists
    db_showtime = db.query(models.ShowTime).filter(
        models.ShowTime.play_id == ticket.showtime_play_id,
        models.ShowTime.date_and_time == ticket.showtime_date_and_time
    ).first()
    if not db_showtime:
        raise HTTPException(status_code=404, detail="Showtime does not exist")
    
    # Check if the seat is already booked for this showtime
    existing_ticket = db.query(models.Ticket).filter(
        models.Ticket.row_no == ticket.row_no,
        models.Ticket.seat_no == ticket.seat_no,
        models.Ticket.showtime_date_and_time == ticket.showtime_date_and_time,
        models.Ticket.showtime_play_id == ticket.showtime_play_id
    ).first()
    if existing_ticket:
        raise HTTPException(status_code=400, detail="This seat is already booked for this showtime")
    
    return ticket_crud.create_ticket(db=db, ticket=ticket, customer_id=current_user.id)

@router.get("/", response_model=List[ticket_schemas.TicketResponse])
def read_user_tickets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.Customer = Depends(get_current_user)):
    tickets = ticket_crud.get_tickets_by_customer(db, customer_id=current_user.id, skip=skip, limit=limit)
    return tickets

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_to_delete: ticket_schemas.TicketDelete, db: Session = Depends(get_db), current_user: models.Customer = Depends(get_current_user)):
    db_ticket = ticket_crud.delete_ticket(
        db=db, 
        row_no=ticket_to_delete.row_no,
        seat_no=ticket_to_delete.seat_no,
        showtime_date_and_time=ticket_to_delete.showtime_date_and_time,
        showtime_play_id=ticket_to_delete.showtime_play_id,
        customer_id=current_user.id
    )
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found or you do not have permission to delete it")
    return
