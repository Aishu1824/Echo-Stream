from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
import shutil

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError

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
    with open(file.filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()

    # create DB entry first
    new_audio = AudioFile(
        filename=file.filename,
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