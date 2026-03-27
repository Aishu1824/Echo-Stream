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
    audio.transcript = f"Transcript of {audio.filename}"
    audio.status = "completed"

    db.commit()
    db.close()

    print("Completed")
    