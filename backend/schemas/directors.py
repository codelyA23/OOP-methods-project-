from pydantic import BaseModel
from typing import Optional

class DirectorBase(BaseModel):
    name: str
    date_of_birth: Optional[int] = None
    citizenship: Optional[str] = None

class DirectorCreate(DirectorBase):
    pass

class DirectorResponse(DirectorBase):
    id: int

    class Config:
        from_attributes = True
