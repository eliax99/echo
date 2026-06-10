from langgraph.graph import StateGraph

from backend.rag.retriever import search_docs


def run_agent(message: str, game_id: int):
    """
    RAG simple + respuesta base
    """

    docs = search_docs(message)

    context = "\n".join(docs) if docs else ""

    response = f"{message}\n\nContext:\n{context}"

    return {
        "response": response
    }