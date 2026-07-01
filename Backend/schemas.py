from pydantic import BaseModel
from typing import Optional
class UserCreate(BaseModel):

    FirstName: str
    LastName: str
    email: str
    password: str

class UserRead(BaseModel):
    id:int
    FirstName: str
    LastName: str
    ProfilePic: Optional[str]=None
    bio: Optional[str]=None
    class Config():
        from_attributes = True

class Login(BaseModel):
    email:str
    password:str

class Token(BaseModel):
    access_token:str
    token_type:str

class TokenData(BaseModel):
    email: Optional[str]=None

class PostCreate(BaseModel):
    content: str
    image_url: str | None=None

class CommentCreate(BaseModel):
    content: str

class UserUpdate(BaseModel):
    FirstName: Optional[str] = None
    LastName: Optional[str] = None
    bio: Optional[str] = None
    ProfilePic: Optional[str] = None

class GoogleToken(BaseModel):
    token: str
