from pydantic import BaseModel, EmailStr
from typing import Optional

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    telephone_no: Optional[str] = None

class CustomerCreate(CustomerBase):
    hashed_password: str

class CustomerResponse(CustomerBase):
    id: int
    role: str

    class Config:
        from_attributes = True
