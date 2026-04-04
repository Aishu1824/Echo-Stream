import chromadb
from sentence_transformers import SentenceTransformer
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