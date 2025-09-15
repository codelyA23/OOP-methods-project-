from sqlalchemy.orm import Session
from .. import models
from ..schemas import actors as actor_schemas

def get_actor(db: Session, actor_id: int):
    return db.query(models.Actor).filter(models.Actor.id == actor_id).first()

def get_actors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Actor).offset(skip).limit(limit).all()

def create_actor(db: Session, actor: actor_schemas.ActorCreate):
    db_actor = models.Actor(**actor.model_dump())
    db.add(db_actor)
    db.commit()
    db.refresh(db_actor)
    return db_actor

def update_actor(db: Session, actor_id: int, actor: actor_schemas.ActorCreate):
    db_actor = get_actor(db, actor_id)
    if db_actor:
        for key, value in actor.model_dump(exclude_unset=True).items():
            setattr(db_actor, key, value)
        db.commit()
        db.refresh(db_actor)
    return db_actor

def delete_actor(db: Session, actor_id: int):
    db_actor = get_actor(db, actor_id)
    if not db_actor:
        return None
        
    # Check if actor is associated with any plays
    if db_actor.plays:
        play_titles = [play.title for play in db_actor.plays]
        raise ValueError(f"Cannot delete actor '{db_actor.name}' because they are associated with the following plays: {', '.join(play_titles)}. Please remove the actor from these plays first.")
    
    db.delete(db_actor)
    db.commit()
    return db_actor
