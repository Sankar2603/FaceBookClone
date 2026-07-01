from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas, database, hashing, jwt_token as token
import os
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = "1047116401076-vp4kgetr183pcl5v766a930vdnqaacj5.apps.googleusercontent.com"
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.username).first()
    if not user or not hashing.Hash.verify(user.password, request.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = token.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google")
def google_login(request: schemas.GoogleToken, db: Session = Depends(database.get_db)):
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            request.token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
        
        email = idinfo.get("email")
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        profile_pic = idinfo.get("picture", "")
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if not user:
            # Create a new user with a random unguessable password
            random_password = os.urandom(16).hex()
            hashed_password = hashing.Hash.argon2(random_password)
            
            user = models.User(
                FirstName=first_name,
                LastName=last_name,
                email=email,
                password=hashed_password,
                ProfilePic=profile_pic
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # Issue our standard JWT token
        access_token = token.create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
