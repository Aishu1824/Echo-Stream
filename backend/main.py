from fastapi import FastAPI, UploadFile, File
import shutil
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base,SessionLocal
from models import AudioFile
from routes import auth

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    with open(file.filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()
    new_audio = AudioFile(filename=file.filename)
    db.add(new_audio)
    db.commit()
    db.close()

    return {"status": "uploaded"}