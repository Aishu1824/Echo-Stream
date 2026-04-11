from celery import Celery
from database import SessionLocal
from models import AudioFile
import whisper
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from textblob import TextBlob
from rag_utils import save_transcript_to_vector_db

# -------------------- CELERY CONFIG --------------------

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0"
)

# -------------------- LOAD WHISPER MODEL --------------------

print("Loading Whisper AI model...")
model = whisper.load_model("tiny")

# -------------------- PROCESS AUDIO TASK --------------------

@celery_app.task
def process_audio(audio_id):
    db = SessionLocal()

    try:
        audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()

        if not audio:
            print("Audio not found")
            return

        print("Processing:", audio.filepath)

        # -------------------- TRANSCRIPTION --------------------

        result = model.transcribe(audio.filepath)
        transcript = result.get("text", "").strip()

        audio.transcript = transcript

        # -------------------- SAVE TO VECTOR DATABASE --------------------

        if transcript:
            save_transcript_to_vector_db(audio.id, transcript)

        # -------------------- SUMMARY GENERATION --------------------

        try:
            parser = PlaintextParser.from_string(
                transcript,
                Tokenizer("english")
            )

            summarizer = LsaSummarizer()
            summary_sentences = summarizer(parser.document, 2)

            summary = " ".join(
                str(sentence) for sentence in summary_sentences
            )

            audio.summary = summary if summary else "No summary generated."

        except Exception as summary_error:
            print("Summary Error:", summary_error)
            audio.summary = "Summary generation failed."

        # -------------------- ACTION ITEM EXTRACTION --------------------

        try:
            action_keywords = [
                "need to",
                "must",
                "should",
                "deadline",
                "complete",
                "finish",
                "submit",
                "review",
                "update",
                "fix"
            ]

            sentences = transcript.split(".")
            actions = []

            for sentence in sentences:
                sentence_lower = sentence.lower()

                for keyword in action_keywords:
                    if keyword in sentence_lower:
                        actions.append(sentence.strip())
                        break

            if actions:
                audio.action_items = "\n".join(actions[:5])
            else:
                audio.action_items = "No action items found."

        except Exception as action_error:
            print("Action Item Error:", action_error)
            audio.action_items = "Action item extraction failed."

        # -------------------- SENTIMENT ANALYSIS --------------------

        try:
            sentiment_score = TextBlob(transcript).sentiment.polarity

            if sentiment_score > 0.1:
                audio.sentiment = "Positive"
            elif sentiment_score < -0.1:
                audio.sentiment = "Negative"
            else:
                audio.sentiment = "Neutral"

        except Exception as sentiment_error:
            print("Sentiment Error:", sentiment_error)
            audio.sentiment = "Neutral"

        # -------------------- FINAL STATUS --------------------

        audio.status = "completed"
        db.commit()

        print("Completed:", audio.filename)

    except Exception as e:
        print("Whisper Error:", e)

        if 'audio' in locals() and audio:
            audio.status = "failed"
            db.commit()

    finally:
        db.close()