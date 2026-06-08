import chromadb
from langchain_community.embeddings import HuggingFaceEmbeddings

client = chromadb.PersistentClient(path="rag/chroma_db")
collection = client.get_or_create_collection("echo_docs")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def search_docs(query: str, k: int = 3):
    query_embedding = embeddings.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k
    )

    return results["documents"][0]