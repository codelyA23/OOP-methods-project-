from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..schemas import plays as play_schemas
from ..crud import plays as play_crud
from ..database import get_db
from ..auth.dependencies import get_current_admin_user
from .. import models

router = APIRouter(prefix="/plays", tags=["Plays"])

@router.post("/", response_model=play_schemas.PlayResponse, status_code=status.HTTP_201_CREATED)
def create_play(play: play_schemas.PlayCreate, db: Session = Depends(get_db), current_user: models.Customer = Depends(get_current_admin_user)):
    return play_crud.create_play(db, play)

@router.get("/", response_model=List[play_schemas.PlayResponse])
def read_plays(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return play_crud.get_all_plays(db, skip, limit)

@router.get("/{play_id}", response_model=play_schemas.PlayResponse)
def read_play(play_id: int, db: Session = Depends(get_db)):
    db_play = play_crud.get_play(db, play_id)
    if db_play is None:
        raise HTTPException(status_code=404, detail="Play not found")
    return db_play

@router.put("/{play_id}", response_model=play_schemas.PlayResponse)
def update_play(play_id: int, play: play_schemas.PlayUpdate, db: Session = Depends(get_db), current_user: models.Customer = Depends(get_current_admin_user)):
    db_play = play_crud.update_play(db, play_id, play)
    if db_play is None:
        raise HTTPException(status_code=404, detail="Play not found")
    return db_play

@router.delete("/{play_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_play(play_id: int, db: Session = Depends(get_db), current_user: models.Customer = Depends(get_current_admin_user)):
    db_play = play_crud.delete_play(db, play_id)
    if db_play is None:
        raise HTTPException(status_code=404, detail="Play not found")
    return
