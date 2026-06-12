from pathlib import Path

import chromadb

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    HuggingFaceEmbeddings = None


CHROMA_PATH = str(Path(__file__).resolve().parent / "chroma_db")

client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection("echo_docs")

# Cache the embeddings model — loading it every request takes 10-30s
_embeddings_instance = None


def get_embeddings():
    global _embeddings_instance
    if _embeddings_instance is not None:
        return _embeddings_instance
    if HuggingFaceEmbeddings is None:
        raise ImportError("langchain-huggingface is not installed")
    _embeddings_instance = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings_instance


def search_docs(query: str, k: int = 3):
    try:
        embeddings = get_embeddings()
        query_embedding = embeddings.embed_query(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=k
        )
        return results.get("documents", [[]])[0]
    except Exception as e:
        print(f"[search_docs] Error: {e}")
        return []
