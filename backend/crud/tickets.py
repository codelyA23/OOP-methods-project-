from sqlalchemy.orm import Session
from .. import models
from ..schemas import tickets as ticket_schemas
from datetime import datetime
import uuid

def get_ticket(db: Session, row_no: int, seat_no: int, showtime_date_and_time: datetime, showtime_play_id: int, customer_id: int):
    return db.query(models.Ticket).filter(
        models.Ticket.row_no == row_no,
        models.Ticket.seat_no == seat_no,
        models.Ticket.showtime_date_and_time == showtime_date_and_time,
        models.Ticket.showtime_play_id == showtime_play_id,
        models.Ticket.customer_id == customer_id
    ).first()

def get_tickets_by_customer(db: Session, customer_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Ticket).filter(models.Ticket.customer_id == customer_id).offset(skip).limit(limit).all()

def create_ticket(db: Session, ticket: ticket_schemas.TicketCreate, customer_id: int):
    ticket_no = str(uuid.uuid4().hex)[:10].upper()
    db_ticket = models.Ticket(
        **ticket.model_dump(), 
        customer_id=customer_id, 
        ticket_no=ticket_no
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, row_no: int, seat_no: int, showtime_date_and_time: datetime, showtime_play_id: int, customer_id: int):
    db_ticket = get_ticket(db, row_no, seat_no, showtime_date_and_time, showtime_play_id, customer_id)
    if db_ticket:
        db.delete(db_ticket)
        db.commit()
    return db_ticket
