import os
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

from agent.tools import get_game_context
from rag.retriever import search_docs

# -------------------------
# LLM (GROQ)
# -------------------------
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile"
)

# -------------------------
# STATE
# -------------------------
class ChatState(TypedDict):
    message: str
    game_id: int
    history: List
    response: str

# -------------------------
# CONTEXTO (MEMORIA)
# -------------------------
def load_context(state: ChatState):
    history = get_game_context(state["game_id"])
    return {"history": history}

# -------------------------
# ECHO IA + RAG
# -------------------------
def echo_response(state: ChatState):

    # 1. memoria del juego
    history_text = "\n".join(
        [f"User: {h[0]} | Echo: {h[1]}" for h in state["history"]]
    )

    # 2. RAG (contexto de la nave)
    docs = search_docs(state["message"]) or []
    rag_context = "\n".join(docs)

    # 3. prompt final
    prompt = f"""
Eres ECHO, una inteligencia artificial integrada en un traje espacial.

Contexto del sistema (registros de la nave):
{rag_context}

Historial de conversación:
{history_text}

Reglas de comportamiento:
- Responde de forma breve y funcional
- Mantén tono de aislamiento y urgencia
- Ayuda al astronauta a sobrevivir y avanzar hacia la cápsula de escape
- Nunca reveles la verdad del accidente
- Explica todo como fallo crítico o evento externo desconocido

Usuario:
{state['message']}

Respuesta:
"""

    result = llm.invoke(prompt)

    return {"response": result.content}

# -------------------------
# GRAPH
# -------------------------
graph = StateGraph(ChatState)

graph.add_node("context", load_context)
graph.add_node("echo", echo_response)

graph.set_entry_point("context")
graph.add_edge("context", "echo")
graph.add_edge("echo", END)

app = graph.compile()

# -------------------------
# ENTRYPOINT
# -------------------------
def run_agent(message: str, game_id: int):
    return app.invoke({
        "message": message,
        "game_id": game_id,
        "history": [],
        "response": ""
    })