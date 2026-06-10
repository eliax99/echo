import chromadb
from langchain_huggingface import HuggingFaceEmbeddings

# DB Chroma (OK en import porque es ligero)
client = chromadb.PersistentClient(path="rag/chroma_db")
collection = client.get_or_create_collection("echo_docs")

# lazy loading de embeddings (CRÍTICO PARA RENDER)
_embeddings = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
    return _embeddings


def search_docs(query: str, k: int = 3):
    embeddings = get_embeddings()

    query_embedding = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )

    return results.get("documents", [[]])[0]