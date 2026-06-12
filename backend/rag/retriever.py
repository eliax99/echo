"""
RAG retriever using ChromaDB with default (onnx-based) embeddings.
Much lighter than sentence-transformers — fits in Render's 512MB RAM.
"""

from pathlib import Path
import chromadb

DOCS_DIR = Path(__file__).resolve().parent / "docs"
CHROMA_PATH = str(Path(__file__).resolve().parent / "chroma_db")

# ChromaDB client with persistent storage
_client = chromadb.PersistentClient(path=CHROMA_PATH)
_collection = _client.get_or_create_collection("echo_docs")


def _ensure_docs_indexed():
    """Index all .txt docs into ChromaDB if not already present."""
    if _collection.count() > 0:
        return  # already indexed

    if not DOCS_DIR.exists():
        return

    for file in sorted(DOCS_DIR.glob("*.txt")):
        try:
            text = file.read_text(encoding="utf-8").strip()
            if not text:
                continue
            # Split into chunks of ~500 chars
            chunks = []
            for i in range(0, len(text), 500):
                chunk = text[i : i + 500].strip()
                if chunk:
                    chunks.append(chunk)

            for i, chunk in enumerate(chunks):
                doc_id = f"{file.stem}_{i}"
                _collection.add(
                    ids=[doc_id],
                    documents=[chunk],
                    metadatas=[{"source": file.name}],
                )
            print(f"[RAG] Indexed {file.name}: {len(chunks)} chunks")
        except Exception as e:
            print(f"[RAG] Error indexing {file.name}: {e}")


# Index on import
_ensure_docs_indexed()


def search_docs(query: str, k: int = 3) -> list[str]:
    """Search game documents using ChromaDB's default embeddings."""
    try:
        if _collection.count() == 0:
            return []
        results = _collection.query(query_texts=[query], n_results=k)
        docs = results.get("documents", [[]])[0]
        return docs
    except Exception as e:
        print(f"[search_docs] Error: {e}")
        return []