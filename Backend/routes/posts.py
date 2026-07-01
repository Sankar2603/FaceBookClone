from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas, database, jwt_token as token

router = APIRouter(prefix="/posts", tags=["Posts"])
get_db = database.get_db

@router.post("/")
def create_post(request: schemas.PostCreate, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    post = models.Post(content=request.content, image_url=request.image_url, user_id=current_user.id)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.get("/")
def get_all_posts(db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    friendships = db.query(models.Friendship).filter(
        models.Friendship.status == models.FriendshipStatus.accepted,
        ((models.Friendship.user_id == current_user.id) | (models.Friendship.friend_id == current_user.id))
    ).all()

    friend_ids = {current_user.id}
    for f in friendships:
        friend_ids.add(f.friend_id if f.user_id == current_user.id else f.user_id)

    posts = db.query(models.Post).filter(models.Post.user_id.in_(friend_ids)).order_by(models.Post.created_at.desc()).all()
    return posts

@router.get("/{id}")
def get_post(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.id:
        friendship = db.query(models.Friendship).filter(
            models.Friendship.status == models.FriendshipStatus.accepted,
            (
                (models.Friendship.user_id == current_user.id) & (models.Friendship.friend_id == post.user_id)
            ) | (
                (models.Friendship.friend_id == current_user.id) & (models.Friendship.user_id == post.user_id)
            )
        ).first()
        if not friendship:
            raise HTTPException(status_code=403, detail="Not allowed to view this post")
    return post


@router.delete("/{id}")
def delete_post(id: int, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == id, models.Post.user_id == current_user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}
