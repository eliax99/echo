import chromadb
from langchain_huggingface import HuggingFaceEmbeddings

client = chromadb.PersistentClient(path="rag/chroma_db")
collection = client.get_or_create_collection("echo_docs")


def get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def search_docs(query: str, k: int = 3):
    embeddings = get_embeddings()

    query_embedding = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )

    return results.get("documents", [[]])[0]