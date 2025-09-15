from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .plays import PlayResponse

class ShowTimeBase(BaseModel):
    date_and_time: datetime
    play_id: int

class ShowTimeCreate(ShowTimeBase):
    pass

class ShowTimeResponse(ShowTimeBase):
    venue: Optional[str] = None
    available_seats: Optional[int] = None
    play: Optional[PlayResponse] = None
    
    class Config:
        from_attributes = True

class ShowTimeUpdate(BaseModel):
    date_and_time: datetime | None = None
    venue: str | None = None

class ShowTimeDelete(BaseModel):
    play_id: int
    date_and_time: datetime
