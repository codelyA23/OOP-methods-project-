from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class ShowTimePriceBase(BaseModel):
    row_no: int
    seat_no: int
    showtime_date_and_time: datetime
    showtime_play_id: int
    price: Decimal

class ShowTimePriceCreate(ShowTimePriceBase):
    pass

class ShowTimePriceResponse(ShowTimePriceBase):
    class Config:
        from_attributes = True

class ShowTimePriceUpdate(BaseModel):
    price: Decimal
