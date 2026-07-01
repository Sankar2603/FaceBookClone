from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, database, jwt_token as token

router = APIRouter(prefix="/likes", tags=["Likes"])
get_db = database.get_db

@router.post("/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    existing_like = db.query(models.Like).filter(models.Like.post_id == post_id, models.Like.user_id == current_user.id).first()
    if existing_like:
        raise HTTPException(status_code=400, detail="Already liked")
    like = models.Like(post_id=post_id, user_id=current_user.id)
    db.add(like)
    db.commit()
    return {"message": "Post liked"}

@router.post("/{post_id}/unlike")
def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    like = db.query(models.Like).filter(models.Like.post_id == post_id, models.Like.user_id == current_user.id).first()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    db.delete(like)
    db.commit()
    return {"message": "Post unliked"}

@router.get("/{post_id}")
def get_likes(post_id: int, db: Session = Depends(get_db)):
    likes = db.query(models.Like).filter(models.Like.post_id == post_id).all()
    return {"count": len(likes), "likes": likes}
