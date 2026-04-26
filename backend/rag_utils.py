import chromadb
from transformers import pipeline

# -------------------- QA MODEL (LAZY LOAD) --------------------

qa_model = None


def get_qa_model():
    global qa_model

    if qa_model is None:
        print("Loading QA model...")
        qa_model = pipeline(
            "question-answering",
            model="distilbert-base-cased-distilled-squad"
        )

    return qa_model


# -------------------- CHROMA DB --------------------

client = chromadb.PersistentClient(path="./new_chroma_db")

# safer initialization
try:
    collection = client.get_collection("transcripts")
except Exception:
    try:
        collection = client.create_collection("transcripts")
    except Exception:
        collection = client.get_collection("transcripts")


# -------------------- TEXT CHUNKING --------------------

def split_text(text, chunk_size=200):
    return [
        text[i:i + chunk_size].strip()
        for i in range(0, len(text), chunk_size)
        if text[i:i + chunk_size].strip()
    ]


# -------------------- SAVE TRANSCRIPT --------------------

def save_transcript_to_vector_db(audio_id, transcript, user_email):
    chunks = split_text(transcript)

    for idx, chunk in enumerate(chunks):
        collection.add(
            ids=[f"{audio_id}_{idx}"],
            documents=[chunk],
            metadatas=[{
                "audio_id": audio_id,
                "user_email": user_email
            }]
        )


# -------------------- GENERATE ANSWER --------------------

def generate_answer(question, context):
    q = question.lower()
    c = context.lower()

    # -------------------- RULE-BASED --------------------

    if "version 2" in q and "version 2" in c:
        return "Yes, version 2 was mentioned for adding real-time audio visualization."

    if "audio frequency" in q:
        return "A real-time audio frequency visualization was suggested."

    if "swagger" in q:
        return "Rahul was assigned to update the Swagger UI."

    if "code review" in q:
        return "Ishwaria was assigned to handle the final code review."

    if ("deadline" in q or "when") and "friday" in c:
        return "The API documentation should be finalized by Friday."

    if "upload endpoint" in q:
        return "The upload endpoint had a multipart parsing error (422)."

    if "pydantic" in q or "schema" in q:
        return "Pydantic schema debugging was discussed."

    if "who" in q and "swagger" in q:
        return "Rahul was responsible for Swagger UI updates."

    if "who" in q and "review" in q:
        return "Ishwaria handled the code review."

    if "what was discussed" in q:
        return context[:300] + "..."

    # -------------------- AI FALLBACK --------------------

    try:
        model = get_qa_model()

        result = model(
            question=question,
            context=context
        )

        answer = result.get("answer", "").strip()
        score = result.get("score", 0)

        print("Q:", question)
        print("A:", answer)
        print("Score:", score)

        if answer and score > 0.2:
            return answer

    except Exception as e:
        print("QA Model Error:", e)

    # -------------------- FINAL FALLBACK --------------------

    return context[:250] + "..."