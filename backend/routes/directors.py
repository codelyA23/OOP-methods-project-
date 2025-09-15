from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas import directors as director_schemas
from ..crud import directors as director_crud
from ..database import get_db
from ..auth.dependencies import get_current_admin_user

router = APIRouter(
    prefix="/directors",
    tags=["directors"],
)

@router.post("/", response_model=director_schemas.DirectorResponse, status_code=201, dependencies=[Depends(get_current_admin_user)])
def create_director(director: director_schemas.DirectorCreate, db: Session = Depends(get_db)):
    return director_crud.create_director(db=db, director=director)

@router.get("/", response_model=List[director_schemas.DirectorResponse])
def read_directors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    directors = director_crud.get_directors(db, skip=skip, limit=limit)
    return directors

@router.get("/{director_id}", response_model=director_schemas.DirectorResponse)
def read_director(director_id: int, db: Session = Depends(get_db)):
    db_director = director_crud.get_director(db, director_id=director_id)
    if db_director is None:
        raise HTTPException(status_code=404, detail="Director not found")
    return db_director

@router.put("/{director_id}", response_model=director_schemas.DirectorResponse, dependencies=[Depends(get_current_admin_user)])
def update_director(director_id: int, director: director_schemas.DirectorCreate, db: Session = Depends(get_db)):
    db_director = director_crud.update_director(db, director_id=director_id, director=director)
    if db_director is None:
        raise HTTPException(status_code=404, detail="Director not found")
    return db_director

@router.delete("/{director_id}", response_model=director_schemas.DirectorResponse, dependencies=[Depends(get_current_admin_user)])
def delete_director(director_id: int, db: Session = Depends(get_db)):
    db_director = director_crud.delete_director(db, director_id=director_id)
    if db_director is None:
        raise HTTPException(status_code=404, detail="Director not found")
    return db_director
