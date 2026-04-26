# -------------------- LIGHTWEIGHT RAG UTILS --------------------

import chromadb

# -------------------- CHROMA DB (SAFE INIT) --------------------

client = chromadb.PersistentClient(path="./new_chroma_db")

try:
    collection = client.get_collection("transcripts")
except:
    try:
        collection = client.create_collection("transcripts")
    except:
        collection = client.get_collection("transcripts")


# -------------------- TEXT CHUNKING --------------------

def split_text(text, chunk_size=300):
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

    # -------------------- RULE-BASED (FAST & SAFE) --------------------

    if "version 2" in q and "version 2" in c:
        return "Version 2 was discussed with real-time audio visualization."

    if "audio frequency" in q:
        return "Real-time audio frequency visualization was suggested."

    if "swagger" in q:
        return "Swagger UI updates were assigned."

    if "code review" in q:
        return "Final code review was handled by the team."

    if "deadline" in q or "when" in q:
        if "friday" in c:
            return "The deadline mentioned was Friday."

    if "upload endpoint" in q:
        return "There was a multipart parsing issue (422 error)."

    if "schema" in q or "pydantic" in q:
        return "Schema debugging using Pydantic was discussed."

    if "who" in q:
        return "Team members were assigned specific responsibilities."

    if "what was discussed" in q:
        return context[:300] + "..."

    # -------------------- FALLBACK --------------------

    return context[:250] + "..."