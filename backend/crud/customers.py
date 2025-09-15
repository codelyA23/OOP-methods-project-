from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException
from datetime import datetime

from ..models import Customer
from ..schemas.customers import CustomerCreate, CustomerResponse


def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    return db.query(Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    db_customer = Customer(
        name=customer.name,
        email=customer.email,
        hashed_password=customer.hashed_password,
        telephone_no=customer.telephone_no,
        role="customer"
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer: CustomerCreate) -> Optional[Customer]:
    db_customer = get_customer(db, customer_id)
    if db_customer is None:
        return None
    
    db_customer.name = customer.name
    db_customer.email = customer.email
    db_customer.hashed_password = customer.hashed_password
    db_customer.telephone_no = customer.telephone_no
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int) -> bool:
    db_customer = get_customer(db, customer_id)
    if db_customer is None:
        return False
    
    db.delete(db_customer)
    db.commit()
    return True
