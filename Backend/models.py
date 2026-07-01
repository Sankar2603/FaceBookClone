from sqlalchemy import Column, Integer, String, ForeignKey,DateTime,UniqueConstraint,Enum
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

class FriendshipStatus(enum.Enum):
    pending="pending"
    accepted="accepted"
    blocked="blocked"

class Friendship(Base):
    __tablename__="friendships"
    user_id=Column(Integer,ForeignKey("users.id"),primary_key=True)
    friend_id=Column(Integer,ForeignKey("users.id"),primary_key=True)

    status=Column(Enum(FriendshipStatus),default=FriendshipStatus.pending)
    created_at=Column(DateTime,default=func.now())

    __table_args__ = (
        UniqueConstraint('user_id', 'friend_id', name='_user_friend_uc'),
    )

class User(Base):
    __tablename__="users"

    id=Column(Integer,primary_key=True,index=True)
    FirstName= Column(String)
    LastName=  Column(String)
    email= Column(String, unique=True, index=True)
    password= Column(String)
    bio=Column(String)
    ProfilePic= Column(String)

    class config:
        orm_mode=True

    #relationships

    # 'friends_received' tracks requests where this user is the recipient (Friendship.friend_id)
    friends_received = relationship(
        "Friendship", 
        foreign_keys=[Friendship.friend_id], 
        backref="recipient_user",
        primaryjoin=id == Friendship.friend_id
    )
    
    # 'friends_sent' tracks requests where this user is the initiator (Friendship.user_id)
    friends_sent = relationship(
        "Friendship", 
        foreign_keys=[Friendship.user_id], 
        backref="initiator_user",
        primaryjoin=id == Friendship.user_id
    )
    
    # Relationships to content/interactions (one-to-many)
    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")


class Post(Base):
    __tablename__="posts"
    id=Column(Integer,primary_key=True,index=True)
    content=Column(String(4000))
    image_url=Column(String)
    created_at=Column(DateTime,default=func.now())
    user_id=Column(Integer,ForeignKey("users.id"))

    #relationships 
    user = relationship("User", back_populates="posts")

    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__="comments"

    id=Column(Integer,primary_key=True,index=True)
    content=Column(String(1000))
    created_at=Column(DateTime,default=func.now())
    post_id=Column(Integer,ForeignKey("posts.id",ondelete="CASCADE"))
    user_id=Column(Integer,ForeignKey("users.id"))

    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")


class Like(Base):
    __tablename__="likes"
    id=Column(Integer,primary_key=True,index=True)
    post_id=Column(Integer,ForeignKey("posts.id",ondelete="CASCADE"))
    user_id=Column(Integer,ForeignKey("users.id"))

    __table_args__ = (
        UniqueConstraint('user_id', 'post_id', name='_user_post_uc'),
    )

    #relationship 

    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="likes")
