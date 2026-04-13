from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import shutil
import os
from pathlib import Path

from database import engine, Base, SessionLocal
from models import AudioFile
from routes import auth
from auth_utils import SECRET_KEY, ALGORITHM
from worker import process_audio
from rag_utils import collection, embedding_model, generate_answer

# -------------------- DATABASE --------------------

Base.metadata.create_all(bind=engine)

# -------------------- APP --------------------

app = FastAPI(
    title="EchoStream AI API",
    description="AI-powered audio transcription, meeting summary, sentiment analysis, and Q&A system",
    version="1.0.0"
)

# -------------------- CORS --------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- FILE STORAGE --------------------

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)

# -------------------- ROUTERS --------------------

app.include_router(auth.router)

# -------------------- SECURITY --------------------

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return email

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# -------------------- ROOT --------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to EchoStream AI Backend",
        "status": "running"
    }


# -------------------- HEALTH CHECK --------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EchoStream AI Backend"
    }


# -------------------- AUDIO UPLOAD --------------------

@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_extensions = [".mp3", ".wav", ".m4a"]

    file_extension = os.path.splitext(file.filename)[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only MP3, WAV, and M4A files are allowed"
        )

    safe_filename = file.filename.replace(" ", "_")
    file_path = UPLOAD_FOLDER / safe_filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_audio = AudioFile(
    filename=safe_filename,
    filepath=str(file_path),
    status="processing",
    user_email=user
)

    db.add(new_audio)
    db.commit()
    db.refresh(new_audio)

    process_audio.delay(new_audio.id)

    return {
        "message": "File uploaded successfully",
        "audio_id": new_audio.id,
        "filename": new_audio.filename,
        "status": new_audio.status,
        "uploaded_by": user
    }


# -------------------- GET SINGLE AUDIO STATUS --------------------

@app.get("/audio/{audio_id}")
def get_audio_status(
    audio_id: int,
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()

    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")

    return {
        "id": audio.id,
        "filename": audio.filename,
        "status": audio.status,
        "transcript": audio.transcript,
        "summary": audio.summary,
        "action_items": audio.action_items,
        "sentiment": audio.sentiment,
        "upload_time": audio.upload_time
    }


# -------------------- GET ALL AUDIOS --------------------

@app.get("/audios")
def list_audios(
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audios = db.query(AudioFile).filter(
        AudioFile.user_email == user
    ).order_by(AudioFile.upload_time.desc()).all()

    return [
        {
            "id": audio.id,
            "filename": audio.filename,
            "status": audio.status,
            "transcript": audio.transcript,
            "upload_time": audio.upload_time,
            "summary": audio.summary,
            "action_items": audio.action_items,
            "sentiment": audio.sentiment
        }
        for audio in audios
    ]


# -------------------- DELETE AUDIO --------------------

@app.delete("/audio/{audio_id}")
def delete_audio(
    audio_id: int,
    user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audio = db.query(AudioFile).filter(
    AudioFile.id == audio_id,
    AudioFile.user_email == user
).first()

    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")

    if audio.filepath and os.path.exists(audio.filepath):
        os.remove(audio.filepath)

    db.delete(audio)
    db.commit()

    return {
        "message": "Audio deleted successfully"
    }


# -------------------- AI QUESTION ANSWERING --------------------

@app.post("/ask")
def ask_question(
    question: str,
    user: str = Depends(get_current_user)
):
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    query_embedding = embedding_model.encode(question).tolist()

    results = collection.query(
    query_embeddings=[query_embedding],
    n_results=5,
    where={"user_email": user}
)

    matches = results["documents"][0] if results["documents"] else []

    if not matches:
        return {
            "question": question,
            "answer": "No relevant meeting content found.",
            "matches": []
        }

    context = " ".join(matches)

    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer,
        "matches": matches
    }
