from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    filepath = Column(String, nullable=True)
    status = Column(String, default="uploaded")
    transcript = Column(String, nullable=True)
    upload_time = Column(DateTime, default=datetime.utcnow)
    summary = Column(String, nullable=True)
    action_items = Column(String, nullable=True)
    sentiment = Column(String, nullable=True)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)