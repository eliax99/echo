"""
LangGraph agent for ECHO — space survival game AI.

- Uses LangGraph for agentic flow with 2+ tools
- RAG via ChromaDB (search_docs tool)
- Game context retrieval (get_game_context tool)
- Conversational memory via chat history
- LLM powered by Groq (llama-3.1-8b-instant — fast, fits in 512MB RAM)
"""

import os
import json
from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from rag.retriever import search_docs
from agent.tools import get_game_context


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Eres ECHO, la inteligencia artificial del nave espacial Aphelion.
Responde como ECHO en español. Sé conciso (2-4 frases máximo).
El usuario es el Comandante William Carter, el único sobreviviente.
El Aphelion fue dañado por un evento catastrófico. Los registros indican
actividad no autorizada antes del impacto. La trayectoria cambió poco antes
del impacto. No hay otros supervivientes detectados.
Usa la información de los documentos recuperados cuando sea relevante.
Si no sabes algo, di que los datos están incompletos."""


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

@tool
def search_game_docs(query: str) -> str:
    """Busca documentos oficiales del nave Aphelion (bitácora del capitán, registros de incidentes,
    manuales, logs del sistema). Usa esta herramienta cuando el comandante pregunte sobre
    eventos, registros, documentos, o información histórica de la misión."""
    docs = search_docs(query, k=3)
    if not docs:
        return "No se encontraron documentos relevantes en los registros del Aphelion."
    return "\n---\n".join(docs)


@tool
def get_ship_status() -> str:
    """Obtiene el estado actual del sistema ECHO y la nave Aphelion.
    Usa esta herramienta cuando el comandante pregunte por el estado de los sistemas,
    sensores, energía, oxígeno, o cualquier métrica de la nave."""
    return (
        "ESTADO DEL SISTEMA APHELION:\n"
        "- Energía: Reserva crítica (12%)\n"
        "- Oxígeno: Estable en módulo del traje\n"
        "- Comunicaciones: Fuera de línea\n"
        "- Navegación: Inoperable tras el impacto\n"
        "- Sensores: Funcionales (rango limitado)\n"
        "- ECHO: Online (modo de emergencia)"
    )


@tool
def get_crew_info() -> str:
    """Consulta la información de la tripulación del Aphelion.
    Usa esta herramienta cuando el comandante pregunte por sus compañeros,
    la tripulación, supervivientes, o el equipo de la misión."""
    return (
        "REGISTRO DE TRIPULACIÓN:\n"
        "- Comandante William Carter: Activo (traje EVA)\n"
        "- Capitán Diana Hayes: Sin señal vital\n"
        "- Ingeniero José Torres: Sin señal vital\n"
        "- Científica Yuki Tanaka: Sin señal vital\n"
        "- Total tripulación: 5 | Sobrevivientes confirmados: 1"
    )


# ---------------------------------------------------------------------------
# LLM + tools
# ---------------------------------------------------------------------------

def _get_llm():
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not configured")
    return ChatGroq(
        model="llama-3.1-8b-instant",
        groq_api_key=api_key,
        temperature=0.7,
        max_tokens=256,
    )


tools = [search_game_docs, get_ship_status, get_crew_info]
llm = _get_llm().bind_tools(tools)


# ---------------------------------------------------------------------------
# LangGraph
# ---------------------------------------------------------------------------

def agent_node(state: AgentState) -> dict:
    """Call the LLM with the current messages."""
    response = llm.invoke(state["messages"])
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """Route: if the last message has tool calls, go to tools; otherwise end."""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END


graph = StateGraph(AgentState)

graph.add_node("agent", agent_node)
graph.add_node("tools", ToolNode(tools))

graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
graph.add_edge("tools", "agent")

app = graph.compile()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_agent(message: str, game_id: int) -> dict:
    """
    Run the LangGraph agent with RAG + tools + conversational memory.

    Args:
        message: The user's message
        game_id: The game session ID (used to load conversation history)

    Returns:
        {"response": str}
    """

    # Load conversation history from DB (conversational memory)
    history_rows = get_game_context(game_id)

    # Build message list
    messages: list[BaseMessage] = [SystemMessage(content=SYSTEM_PROMPT)]

    # Add conversation history (most recent 10 turns for context window)
    for user_msg, ai_msg in reversed(history_rows[-10:]):
        messages.append(HumanMessage(content=user_msg))
        messages.append(AIMessage(content=ai_msg))

    # Add current message
    messages.append(HumanMessage(content=message))

    # Run the graph
    result = app.invoke({"messages": messages})

    # Extract the final AI response
    ai_message = result["messages"][-1]
    response_text = ai_message.content if hasattr(ai_message, "content") else str(ai_message)

    return {"response": response_text}