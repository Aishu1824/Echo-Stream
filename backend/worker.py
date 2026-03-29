from celery import Celery
from database import SessionLocal
from models import AudioFile
import whisper

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0"
)

print("Loading Whisper AI model...")
model = whisper.load_model("base")

@celery_app.task
def process_audio(audio_id):
    db = SessionLocal()

    audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()

    if not audio:
        db.close()
        return

    print("Processing:", audio.filepath)

    try:
        result = model.transcribe(audio.filepath)

        audio.transcript = result["text"]
        audio.summary = "Team discussed backend progress, authentication, upload APIs, and future AI integration."
        audio.action_items = """
- Integrate Whisper API
- Improve dashboard UI
- Add transcript search
- Deploy backend next week
"""
        audio.sentiment = "Positive"
        audio.status = "completed"

    except Exception as e:
        print("Whisper Error:", e)
        audio.status = "failed"

    db.commit()
    db.close()

    print("Completed")
    