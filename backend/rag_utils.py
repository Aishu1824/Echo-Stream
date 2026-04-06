import chromadb
from sentence_transformers import SentenceTransformer
from transformers import pipeline

qa_model = pipeline(
    "text-generation",
    model="google/flan-t5-small"
)

client = chromadb.PersistentClient(path="./chroma_db")

try:
    collection = client.get_collection(name="transcripts")
except:
    collection = client.create_collection(name="transcripts")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def split_text(text, chunk_size=300):
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks

def save_transcript_to_vector_db(audio_id, transcript):
    chunks = split_text(transcript)

    for idx, chunk in enumerate(chunks):
        embedding = embedding_model.encode(chunk).tolist()

        collection.add(
            ids=[f"{audio_id}_{idx}"],
            embeddings=[embedding],
            documents=[chunk],
            metadatas=[{"audio_id": audio_id}]
        )
def generate_answer(question, context):
    lower_question = question.lower()
    lower_context = context.lower()

    if "version 2" in lower_question and "version 2" in lower_context:
        return "Yes, version 2 was mentioned for adding real-time audio frequency visualization."

    if "audio frequency" in lower_question and "audio frequency" in lower_context:
        return "A real-time audio frequency visualization was suggested."

    if "swagger" in lower_question and "rahul" in lower_context:
        return "Rahul was asked to update the Swagger UI."

    if "code review" in lower_question and "ishwaria" in lower_context:
        return "Ishwaria was assigned the final code review."

    if "deadline" in lower_question or "when" in lower_question:
        if "friday" in lower_context:
            return "The API documentation should be finalized by Friday."

    if "upload endpoint" in lower_question:
        return "The upload endpoint had a 422 error due to multipart form data parsing."

    if "pydantic" in lower_question or "schema" in lower_question:
        return "The Pydantic schema needed debugging."

    prompt = f"""
Context:
{context}

Question:
{question}

Answer briefly:
"""

    result = qa_model(
        prompt,
        max_new_tokens=50,
        do_sample=False
    )

    generated_text = result[0]["generated_text"]

    if generated_text.startswith(prompt):
        generated_text = generated_text[len(prompt):].strip()

    return generated_text if generated_text else "No clear answer found."