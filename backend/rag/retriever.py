import chromadb

try:
    from langchain_huggingface import HuggingFaceEmbeddings
except ImportError:
    HuggingFaceEmbeddings = None


client = chromadb.PersistentClient(path="backend/rag/chroma_db")
collection = client.get_or_create_collection("echo_docs")


def get_embeddings():
    if HuggingFaceEmbeddings is None:
        raise ImportError("langchain-huggingface is not installed")

    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def search_docs(query: str, k: int = 3):
    embeddings = get_embeddings()

    query_embedding = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )

    return results.get("documents", [[]])[0]