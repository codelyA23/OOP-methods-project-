from pydantic import BaseModel
from typing import Optional

class PlayBase(BaseModel):
    title: str
    duration: int
    price: float
    genre: str
    synopsis: Optional[str] = None

class PlayCreate(PlayBase):
    pass

class PlayUpdate(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    genre: Optional[str] = None
    synopsis: Optional[str] = None

class PlayResponse(PlayBase):
    id: int

    class Config:
        from_attributes = True
