from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base
from datetime import datetime


class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String(255), nullable=False)
    filepath = Column(String(500), nullable=True)

    status = Column(String(50), default="uploaded")

    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)

    sentiment = Column(String(50), nullable=True)

    upload_time = Column(DateTime, default=datetime.utcnow)

    user_email = Column(String(255), nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)