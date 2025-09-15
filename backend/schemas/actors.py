from pydantic import BaseModel
from typing import Optional

class ActorBase(BaseModel):
    name: str
    gender: Optional[str] = None
    date_of_birth: Optional[int] = None

class ActorCreate(ActorBase):
    pass

class ActorResponse(ActorBase):
    id: int

    class Config:
        from_attributes = True
