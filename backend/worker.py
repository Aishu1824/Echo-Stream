from celery import Celery
import time

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0"
)

@celery_app.task
def process_audio(filename):
    print("Processing audio:", filename)
    time.sleep(10)
    print("Processing completed")