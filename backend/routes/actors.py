from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas import actors as actor_schemas
from ..crud import actors as actor_crud
from ..database import get_db
from ..auth.dependencies import get_current_admin_user

router = APIRouter(
    prefix="/actors",
    tags=["actors"],
)

@router.post("/", response_model=actor_schemas.ActorResponse, status_code=201, dependencies=[Depends(get_current_admin_user)])
def create_actor(actor: actor_schemas.ActorCreate, db: Session = Depends(get_db)):
    return actor_crud.create_actor(db=db, actor=actor)

@router.get("/", response_model=List[actor_schemas.ActorResponse])
def read_actors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    actors = actor_crud.get_actors(db, skip=skip, limit=limit)
    return actors

@router.get("/{actor_id}", response_model=actor_schemas.ActorResponse)
def read_actor(actor_id: int, db: Session = Depends(get_db)):
    db_actor = actor_crud.get_actor(db, actor_id=actor_id)
    if db_actor is None:
        raise HTTPException(status_code=404, detail="Actor not found")
    return db_actor

@router.put("/{actor_id}", response_model=actor_schemas.ActorResponse, dependencies=[Depends(get_current_admin_user)])
def update_actor(actor_id: int, actor: actor_schemas.ActorCreate, db: Session = Depends(get_db)):
    db_actor = actor_crud.update_actor(db, actor_id=actor_id, actor=actor)
    if db_actor is None:
        raise HTTPException(status_code=404, detail="Actor not found")
    return db_actor

@router.delete("/{actor_id}", response_model=actor_schemas.ActorResponse, dependencies=[Depends(get_current_admin_user)])
def delete_actor(actor_id: int, db: Session = Depends(get_db)):
    try:
        db_actor = actor_crud.delete_actor(db, actor_id=actor_id)
        if db_actor is None:
            raise HTTPException(status_code=404, detail="Actor not found")
        return db_actor
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
