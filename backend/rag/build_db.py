import os
import chromadb
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

DOCS_PATH = "rag/docs"

client = chromadb.PersistentClient(path="rag/chroma_db")
collection = client.get_or_create_collection("echo_docs")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

text_splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)

def load_docs():
    docs = []

    for file in os.listdir(DOCS_PATH):
        with open(os.path.join(DOCS_PATH, file), "r", encoding="utf-8") as f:
            text = f.read()
            chunks = text_splitter.split_text(text)

            for i, chunk in enumerate(chunks):
                docs.append((f"{file}_{i}", chunk))

    return docs


def build():
    docs = load_docs()

    for doc_id, text in docs:
        embedding = embeddings.embed_query(text)

        collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            documents=[text]
        )

    print("RAG DB creada correctamente")


if __name__ == "__main__":
    build()