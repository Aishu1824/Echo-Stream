from celery import Celery
import time

from database import SessionLocal
from models import AudioFile

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0"
)

@celery_app.task
def process_audio(audio_id):
    db = SessionLocal()

    audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()

    if not audio:
        return

    print("Processing:", audio.filename)

    time.sleep(10)

    # ⭐ fake transcript
    audio.transcript = """
Team discussed the project timeline and backend progress.
Authentication and upload APIs were completed.
Next tasks include integrating Whisper AI, transcript search, and dashboard improvements.
Deadline for deployment discussion is next week.
"""
    audio.summary = "Team discussed backend progress, authentication, upload APIs, and future AI integration."
    audio.action_items = """
- Integrate Whisper API
- Improve dashboard UI
- Add transcript search
- Deploy backend next week
"""
    audio.sentiment = "Positive"
    audio.status = "completed"

    db.commit()
    db.close()

    print("Completed")
    