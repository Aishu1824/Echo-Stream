from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
import shutil
import os


from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError
from rag_utils import collection, embedding_model
from rag_utils import generate_answer
from database import engine, Base, SessionLocal
from models import AudioFile
from routes import auth
from auth_utils import SECRET_KEY, ALGORITHM
from worker import process_audio
# create tables

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# include auth routes
app.include_router(auth.router)

# security
security = HTTPBearer()


# dependency to get logged in user
def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# protected upload API
@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    # save file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()

    # create DB entry first
    new_audio = AudioFile(
    filename=file.filename,
    filepath=file_path,
    status="processing"
)
    db.add(new_audio)
    db.commit()
    db.refresh(new_audio)

    process_audio.delay(new_audio.id)

    db.close()

    return {
        "status": "uploaded",
        "audio_id": new_audio.id,
        "uploaded_by": user
    }
@app.get("/audio/{audio_id}")
def get_status(audio_id: int):
    db = SessionLocal()
    audio = db.query(AudioFile).filter(AudioFile.id == audio_id).first()
    db.close()

    return {
        "filename": audio.filename,
        "status": audio.status
    }

@app.get("/audios")
def list_audios(user=Depends(get_current_user)):
    db = SessionLocal()
    audios = db.query(AudioFile).all()
    db.close()

    return [
    {
        "id": a.id,
        "filename": a.filename,
        "status": a.status,
        "transcript": a.transcript,
        "upload_time": a.upload_time,
        "summary": a.summary,
        "action_items": a.action_items,
        "sentiment": a.sentiment
    }
    for a in audios

]

@app.post("/ask")
def ask_question(question: str):
    query_embedding = embedding_model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    matches = results["documents"][0]
    context = " ".join(matches)

    answer = generate_answer(question, context)

    return {
        "question": question,
        "answer": answer,
        "matches": matches
    }