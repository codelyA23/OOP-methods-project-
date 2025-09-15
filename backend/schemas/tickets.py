from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base schema with all identifying fields for a ticket
class TicketBase(BaseModel):
    row_no: int
    seat_no: int
    showtime_date_and_time: datetime
    showtime_play_id: int

# Schema for creating a ticket. Customer ID will be taken from the logged-in user.
class TicketCreate(TicketBase):
    pass

# Schema for returning a ticket to the client
class TicketResponse(TicketBase):
    customer_id: int
    ticket_no: Optional[str] = None

    class Config:
        from_attributes = True

# Schema for deleting a ticket. User provides the identifying info.
class TicketDelete(TicketBase):
    pass
