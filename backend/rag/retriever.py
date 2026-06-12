"""
RAG retriever — lightweight keyword-based search across game documents.
ChromaDB was too heavy for Render free tier (512MB RAM).
This approach loads docs into memory once and searches by keyword overlap.
"""

from pathlib import Path
import re

DOCS_DIR = Path(__file__).resolve().parent / "docs"

# Cache docs in memory (they're tiny — 5 files, ~10 lines total)
_docs_cache: list[str] | None = None


def _load_docs() -> list[str]:
    global _docs_cache
    if _docs_cache is not None:
        return _docs_cache
    docs = []
    if DOCS_DIR.exists():
        for f in sorted(DOCS_DIR.glob("*.txt")):
            try:
                text = f.read_text(encoding="utf-8").strip()
                if text:
                    docs.append(text)
            except Exception:
                pass
    _docs_cache = docs
    return docs


def search_docs(query: str, k: int = 3) -> list[str]:
    """Search game docs by keyword overlap. Returns top-k relevant docs."""
    try:
        docs = _load_docs()
        if not docs:
            return []

        words = set(re.findall(r"[a-záéíóúüñ]+", query.lower()))
        scored = []
        for doc in docs:
            doc_words = set(re.findall(r"[a-záéíóúüñ]+", doc.lower()))
            score = len(words & doc_words)
            if score > 0:
                scored.append((score, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:k]]
    except Exception as e:
        print(f"[search_docs] Error: {e}")
        return []