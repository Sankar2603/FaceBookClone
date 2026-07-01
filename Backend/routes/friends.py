from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, jwt_token as token

router = APIRouter(prefix="/friend", tags=["Friends"])
get_db = database.get_db

@router.post("/request/{friend_id}")
def send_friend_request(friend_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")

    if not db.query(models.User).filter(models.User.id == friend_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(models.Friendship).filter(
        ((models.Friendship.user_id == current_user.id) & (models.Friendship.friend_id == friend_id)) |
        ((models.Friendship.user_id == friend_id) & (models.Friendship.friend_id == current_user.id))
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")

    friendship = models.Friendship(user_id=current_user.id, friend_id=friend_id)
    db.add(friendship)
    db.commit()
    return {"message": "Friend request sent"}

@router.put("/accept/{user_id}")
def accept_friend_request(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    friendship = db.query(models.Friendship).filter(
        models.Friendship.user_id == user_id,
        models.Friendship.friend_id == current_user.id,
        models.Friendship.status == models.FriendshipStatus.pending
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="No pending request found")

    friendship.status = models.FriendshipStatus.accepted
    db.commit()
    return {"message": "Friend request accepted"}

@router.delete("/unfriend/{user_id}")
def unfriend_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    friendship = db.query(models.Friendship).filter(
        ((models.Friendship.user_id == current_user.id) & (models.Friendship.friend_id == user_id)) |
        ((models.Friendship.user_id == user_id) & (models.Friendship.friend_id == current_user.id)),
        models.Friendship.status == models.FriendshipStatus.accepted
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="You are not friends")
    db.delete(friendship)
    db.commit()
    return {"message": "Unfriended successfully"}

@router.get("/requests")
def get_pending_requests(db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    return db.query(models.Friendship).filter(
        models.Friendship.friend_id == current_user.id,
        models.Friendship.status == models.FriendshipStatus.pending
    ).all()

@router.get("/list")
def get_friends(db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    accepted = db.query(models.Friendship).filter(
        ((models.Friendship.user_id == current_user.id) | (models.Friendship.friend_id == current_user.id)),
        models.Friendship.status == models.FriendshipStatus.accepted
    ).all()

    friends_list = []
    for f in accepted:
        friend_id = f.friend_id if f.user_id == current_user.id else f.user_id
        friend = db.query(models.User).filter(models.User.id == friend_id).first()
        friends_list.append(friend)
    return friends_list

@router.delete("/deny/{user_id}")
def deny_friend_request(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    friendship = db.query(models.Friendship).filter(
        models.Friendship.user_id == user_id,
        models.Friendship.friend_id == current_user.id,
        models.Friendship.status == models.FriendshipStatus.pending
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="No pending request found")
    
    db.delete(friendship)
    db.commit()
    return {"message": "Friend request denied"}

@router.post("/block/{user_id}")
def block_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    if not db.query(models.User).filter(models.User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    
    friendship = db.query(models.Friendship).filter(
        ((models.Friendship.user_id == current_user.id) & (models.Friendship.friend_id == user_id)) |
        ((models.Friendship.user_id == user_id) & (models.Friendship.friend_id == current_user.id))
    ).first()

    if friendship:
        friendship.status = models.FriendshipStatus.blocked
    else:
        friendship = models.Friendship(user_id=current_user.id, friend_id=user_id, status=models.FriendshipStatus.blocked)
        db.add(friendship)
    
    db.commit()
    return {"message": "User blocked"}
