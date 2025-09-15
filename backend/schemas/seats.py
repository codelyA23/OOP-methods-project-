from pydantic import BaseModel

class SeatBase(BaseModel):
    row_no: int
    seat_no: int

class SeatCreate(SeatBase):
    pass

class SeatResponse(SeatBase):
    class Config:
        from_attributes = True

class SeatDelete(BaseModel):
    row_no: int
    seat_no: int
