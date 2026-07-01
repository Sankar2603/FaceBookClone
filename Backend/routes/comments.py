from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, schemas, database, jwt_token as token

router = APIRouter(prefix="/comments", tags=["Comments"])
get_db = database.get_db

@router.post("/{post_id}")
def create_comment(post_id: int, request: schemas.CommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(token.get_current_user)):
    comment = models.Comment(content=request.content, post_id=post_id, user_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/{post_id}")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.desc()).all()
    return comments
