from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database, hashing,jwt_token as token
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])
get_db = database.get_db

@router.post("/", response_model=schemas.UserRead)
def create_user(request: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        FirstName=request.FirstName,
        LastName=request.LastName,
        email=request.email,
        password=hashing.Hash.argon2(request.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=schemas.UserRead)
def get_current_user(current_user: models.User = Depends(token.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserRead)
def update_profile(request: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    if request.FirstName is not None:
        current_user.FirstName = request.FirstName
    if request.LastName is not None:
        current_user.LastName = request.LastName
    if request.bio is not None:
        current_user.bio = request.bio
    if request.ProfilePic is not None:
        current_user.ProfilePic = request.ProfilePic
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/all",response_model=List[schemas.UserRead])
def get_all_users(db: Session = Depends(get_db),current_user:models.User=Depends(token.get_current_user)):
    blocked_friendships = db.query(models.Friendship).filter(
        models.Friendship.status == models.FriendshipStatus.blocked,
        ((models.Friendship.user_id == current_user.id) | (models.Friendship.friend_id == current_user.id))
    ).all()
    
    blocked_ids = {current_user.id}
    for f in blocked_friendships:
        blocked_ids.add(f.friend_id if f.user_id == current_user.id else f.user_id)
        
    users = db.query(models.User).filter(~models.User.id.in_(blocked_ids)).all()
    return users

@router.get("/{id}", response_model=schemas.UserRead)
def view_user(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{id}/posts")
def get_user_posts(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(token.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if id == current_user.id:
        posts = db.query(models.Post).filter(
            models.Post.user_id == id
        ).order_by(models.Post.created_at.desc()).all()
        return posts
    
    friendship = db.query(models.Friendship).filter(
        models.Friendship.status == models.FriendshipStatus.accepted,
        (
            (models.Friendship.user_id == current_user.id) & (models.Friendship.friend_id == id)
        ) | (
            (models.Friendship.friend_id == current_user.id) & (models.Friendship.user_id == id)
        )
    ).first()
    
    if not friendship:
        raise HTTPException(status_code=403, detail="Not friends with this user")
    
    posts = db.query(models.Post).filter(
        models.Post.user_id == id
    ).order_by(models.Post.created_at.desc()).all()
    
    return posts



