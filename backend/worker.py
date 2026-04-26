from celery import Celery
from database import SessionLocal
from models import AudioFile
import os
import ssl
from dotenv import load_dotenv
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from textblob import TextBlob
from rag_utils import save_transcript_to_vector_db

# -------------------- CONFIG --------------------

load_dotenv()

broker_url = os.getenv("REDIS_URL")

celery_app = Celery(
    "worker",
    broker=broker_url
)

# ✅ Fix Upstash SSL warning
celery_app.conf.broker_use_ssl = {
    "ssl_cert_reqs": ssl.CERT_NONE
}

# -------------------- WHISPER MODEL (LOAD ONCE PER WORKER) --------------------

whisper_model = None


def get_whisper_model():
    global whisper_model

    if whisper_model is None:
        import whisper
        print("Loading Whisper model...")
        whisper_model = whisper.load_model("tiny")

    return whisper_model


# -------------------- TASK --------------------

@celery_app.task
def process_audio(audio_id):
    db = SessionLocal()

    try:
        audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()

        if not audio:
            print("Audio not found")
            return

        print("Processing:", audio.filepath)

        # ✅ Load model once
        model = get_whisper_model()

        # -------------------- TRANSCRIPTION --------------------

        result = model.transcribe(audio.filepath)
        transcript = result.get("text", "").strip()

        audio.transcript = transcript

        # -------------------- SAVE --------------------

        if transcript:
            save_transcript_to_vector_db(
                audio.id,
                transcript,
                audio.user_email
            )

        # -------------------- SUMMARY --------------------

        try:
            parser = PlaintextParser.from_string(
                transcript,
                Tokenizer("english")
            )

            summarizer = LsaSummarizer()
            summary_sentences = summarizer(parser.document, 2)

            summary = " ".join(str(s) for s in summary_sentences)

            audio.summary = summary if summary else "No summary generated."

        except Exception as e:
            print("Summary Error:", e)
            audio.summary = "Summary failed."

        # -------------------- ACTION ITEMS --------------------

        try:
            keywords = [
                "need to", "must", "should", "deadline",
                "complete", "finish", "submit", "review",
                "update", "fix"
            ]

            sentences = transcript.split(".")
            actions = []

            for s in sentences:
                s_lower = s.lower()
                if any(k in s_lower for k in keywords):
                    actions.append(s.strip())

            audio.action_items = "\n".join(actions[:5]) if actions else "No action items found."

        except Exception as e:
            print("Action Error:", e)
            audio.action_items = "Action extraction failed."

        # -------------------- SENTIMENT --------------------

        try:
            score = TextBlob(transcript).sentiment.polarity

            if score > 0.1:
                audio.sentiment = "Positive"
            elif score < -0.1:
                audio.sentiment = "Negative"
            else:
                audio.sentiment = "Neutral"

        except Exception as e:
            print("Sentiment Error:", e)
            audio.sentiment = "Neutral"

        # -------------------- FINAL --------------------

        audio.status = "completed"
        db.commit()

        print("Completed:", audio.filename)

    except Exception as e:
        print("Processing Error:", e)

        if 'audio' in locals() and audio:
            audio.status = "failed"
            db.commit()

    finally:
        db.close()