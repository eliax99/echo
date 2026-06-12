from pathlib import Path
import re


DOCS_DIR = Path(__file__).resolve().parent / "docs"


def _load_all_docs():
    """Load all .txt files from the docs directory."""
    docs = []
    if not DOCS_DIR.exists():
        return docs
    for file in sorted(DOCS_DIR.glob("*.txt")):
        try:
            text = file.read_text(encoding="utf-8").strip()
            if text:
                docs.append(text)
        except Exception:
            pass
    return docs


# Cache docs in memory (they're tiny)
_all_docs = None


def _get_docs():
    global _all_docs
    if _all_docs is None:
        _all_docs = _load_all_docs()
    return _all_docs


def search_docs(query: str, k: int = 3):
    """Simple keyword-based search across game docs. No ML model needed."""
    try:
        docs = _get_docs()
        if not docs:
            return []

        # Split query into words, normalize
        words = set(re.findall(r"[a-záéíóúüñ]+", query.lower()))

        scored = []
        for doc in docs:
            doc_lower = doc.lower()
            # Count how many query words appear in the doc
            score = sum(1 for w in words if w in doc_lower)
            if score > 0:
                scored.append((score, doc))

        # Return top-k docs sorted by relevance
        scored.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored[:k]]
    except Exception as e:
        print(f"[search_docs] Error: {e}")
        return []
