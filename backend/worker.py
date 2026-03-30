from celery import Celery
from database import SessionLocal
from models import AudioFile
import whisper
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from textblob import TextBlob

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
        parser = PlaintextParser.from_string(audio.transcript, Tokenizer("english"))
        summarizer = LsaSummarizer()

        summary_sentences = summarizer(parser.document, 2)
        audio.summary = " ".join(str(sentence) for sentence in summary_sentences)
        action_keywords = ["need to", "must", "should", "deadline", "complete", "finish"]

        sentences = audio.transcript.split(".")
        actions = []

        for sentence in sentences:
            for keyword in action_keywords:
                if keyword in sentence.lower():
                    actions.append(sentence.strip())
                    break

        audio.action_items = "\n".join(actions[:5])
        
        sentiment_score = TextBlob(audio.transcript).sentiment.polarity

        if sentiment_score > 0.1:
            audio.sentiment = "Positive"
        elif sentiment_score < -0.1:
            audio.sentiment = "Negative"
        else:
            audio.sentiment = "Neutral"
        audio.status = "completed"

    except Exception as e:
        print("Whisper Error:", e)
        audio.status = "failed"

    db.commit()
    db.close()

    print("Completed")
    