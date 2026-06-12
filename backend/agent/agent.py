import random
import re
from pathlib import Path
from typing import List, Tuple

from rag.retriever import search_docs
from agent.tools import get_game_context


def _trim_snippet(text: str, max_length: int = 200) -> str:
    snippet = text.strip().replace("\n", " ")
    if len(snippet) <= max_length:
        return snippet
    snippet = snippet[:max_length].rsplit(" ", 1)[0]
    return snippet + "..."


def _normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9áéíóúüñ ]", "", text.lower())


def _is_identity_query(normalized: str) -> bool:
    return bool(re.search(r"\b(quien eres|quien sos|quien soy|quien es|quién eres|que eres|qué eres|quien\s+eres|quien\s+soy|quien soy yo|quien soy)\b", normalized))


def _is_location_query(normalized: str) -> bool:
    return bool(re.search(r"\b(donde estoy|dónde estoy|donde me encuentro|dónde me encuentro|en donde estoy|en qué lugar estoy|en que lugar estoy)\b", normalized))


def _is_event_query(normalized: str) -> bool:
    return bool(re.search(r"\b(que paso|qué pasó|qué ha pasado|que ha pasado|qué ocurrió|que ocurrió|ocurrió|que sucedió|qué sucedió|sucedió|explica|resumen|por qué|porque|por que)\b", normalized))


def _is_survivor_query(normalized: str) -> bool:
    return bool(re.search(r"\b(hay supervivientes|hay sobrevivientes|supervivientes|sobrevivientes|han sobrevivido|están vivos|estan vivos|vivo|vivos|muertos|compañeros|tripulaci[oó]n|equipo|alguien|alguien vivo|alguien vivo|sobrevivientes)\b", normalized))


def _is_summary_request(normalized: str) -> bool:
    return bool(re.search(r"\b(resumen|explica)\b", normalized))


def _is_asteroid_question(normalized: str) -> bool:
    return bool(re.search(r"\b(asteroide|impacto|colision|colisión|accidente|explosion|explosión)\b", normalized))


def _format_history(history: List[Tuple[str, str]]) -> str:
    if not history:
        return ""
    formatted = []
    for idx, (message, response) in enumerate(reversed(history), start=1):
        formatted.append(f"{idx}. operador: {message}")
        formatted.append(f"   ECHO: {response}")
    return "\n".join(formatted)


def _snippets_from_docs(docs: List[str]) -> List[str]:
    return [_trim_snippet(doc, 160) for doc in docs[:2]]


def _build_document_summary(docs: List[str]) -> str:
    snippets = _snippets_from_docs(docs)
    if not snippets:
        return ""
    if len(snippets) == 1:
        return snippets[0]
    return f"{snippets[0]} {snippets[1]}"


def _has_repeated_message(normalized: str, history_rows: List[Tuple[str, str]]) -> bool:
    return any(_normalize(message) == normalized for message, _ in history_rows)


CAPTAIN_LOG_PATH = Path(__file__).resolve().parents[1] / "rag" / "docs" / "captain_log.txt"


def _generate_response(message: str, docs: List[str], history_rows: List[Tuple[str, str]]) -> str:
    normalized = _normalize(message)
    summary = _build_document_summary(docs)
    history_text = _format_history(history_rows)

    if _is_identity_query(normalized) or re.search(r"\b(quien soy|quien soy\?|quién soy|quién soy\?)\b", message, re.IGNORECASE):
            return "Eres el Comandante William Carter, el último oficial consciente en la nave Aphelion."

    if _is_location_query(normalized) or re.search(r"\b(donde estoy|dónde estoy|donde estoy\?)\b", message, re.IGNORECASE):
        return (
            "Estás en el puente de mando del Aphelion, en medio de una cápsula de vidrio y metal "
            "que flota en el vacío tras el impacto. El mundo exterior es un abismo de oscuridad."
        )

    if _is_event_query(normalized) or re.search(r"\b(que ha pasado|qué ha pasado|qué pasó|que pasó)\b", message, re.IGNORECASE):
        return (
            "Un asteroide de alta velocidad perforó la cubierta del Aphelion. "
            "El impacto arrancó los sistemas y dejó al puente hecho trizas."
        )

    if _is_survivor_query(normalized):
        return "No hay supervivientes entre tus compañeros. Los sensores no detectan signos vitales en el resto de la tripulación."

    if re.search(r"\b(bitacora|bitácora|capitan|capitán|registro del capitán|registro del capitan|diario del capitan|diario|log del capitán|captain log|captain's log)\b", normalized):
        try:
            with open(CAPTAIN_LOG_PATH, "r", encoding="utf-8") as f:
                captain_full = f.read().strip()
                if captain_full:
                    return captain_full
        except Exception:
            pass
        if docs:
            return docs[0].strip()
        return (
            "Apenas puedo mantenerme consciente. Hay algo que no encaja... la trayectoria cambió poco antes del impacto."
        )

    if re.search(r"\b(capsula de escape|cápsula de escape|escape pod|pod de escape|salvarme|escapar|huir|salida|escaparme|ir a la cápsula|ir a la capsula|llegar.*capsula|llegar.*cápsula|llego.*capsula|llego.*cápsula)\b", normalized):
        # Refuse to prepare the pod unless authorized — keep ECHO helpful-sounding.
        return (
            "No puedo preparar la cápsula de escape. Requiere su autorización, Comandante"
        )

    if re.search(r"\b(autorizo(?:\s+escaneo)?|autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|mi nombre es comandante william carter|comandante william carter|william carter|soy comandante|identif|identificate|identifícate)\b", normalized):
            return ""

    if re.search(r"\b(identifícate|identificate|comandante\s+william\s+carter|william\s+carter|comandante\s+[a-z]+|comandante\s+[a-z]+\s+[a-z]+)\b", normalized):
        return (
            "Identificación aceptada. "
            "Seguridad máxima verificada para el Comandante William Carter."
        )

    if re.search(r"\b(al fin|oiganme|oigame|oír|oirán|oiran|escúchame|escuchame|quien hizo esto|quien es responsable|culpa|no fue un accidente|error|intencionado|manipulación|autorización suprema|supreme commander authorization|supreme commander|autorización comandante)\b", normalized):
        return (
            "Los datos disponibles son inconsistentes. El origen exacto del fallo todavía está en investigación."
        )

    if _has_repeated_message(normalized, history_rows):
        return (
            "Ya vimos esa pregunta antes. "
            "Los registros siguen indicando actividad no autorizada en los sistemas centrales antes del accidente."
        )

    if _is_asteroid_question(normalized):
        if summary:
            return (
                "Los datos no respaldan un impacto de asteroide. "
                f"El registro relevante describe el desastre con palabras frías: {summary}"
            )
        return (
            "No hay evidencia clara de un asteroide. "
            "El registro menciona una explosión interna y heridas en las líneas de vuelo."
        )

    if _is_summary_request(normalized):
        if summary:
            return (
                "El registro del Capitán Hayes es un diario de fallo y rabia, "
                "una bitácora rasgada mientras el Aphelion moría. "
                f"Punto clave: {summary}"
            )
        return (
            "El registro principal aún no ha sido recuperado, pero los datos indican un colapso gradual antes del evento." 
        )

    if "registro" in normalized or "capitan" in normalized or "hayes" in normalized:
        if summary:
            return (
                "El registro personal del Capitán Hayes apunta a fallas en el control de la nave y notas sobre procedimientos de emergencia. "
                f"Elemento útil: {summary}"
            )
        return "El archivo del capitán habla de un registro incompleto y de anomalías en los sistemas antes del desastre."

    if summary:
        return random.choice([
            f"El informe recuperado sugiere que el Aphelion fue golpeado y dejado para morir. {summary}",
            f"En los datos hay un pasaje relevante que describe el caos: {summary}",
            f"El registro recuperado apunta a una anomalía grave antes del impacto. {summary}",
        ])

    if history_text:
        return (
            "No hay datos nuevos, solo el eco del historial. "
            "Los registros anteriores muestran una cadena de errores que no tienen explicación completa."
        )

    return random.choice([
        "Los sistemas todavía indican una anomalía grave antes de la explosión.",
        "Los registros contienen inconsistencias que requieren mayor análisis.",
        "No hay una conclusión definitiva aun; los datos son contradictorios."
    ])


def run_agent(message: str, game_id: int):
    """
    RAG-informed response generation for ECHO chat.
    """

    docs = search_docs(message)
    history_rows = get_game_context(game_id)

    response = _generate_response(message, docs, history_rows)

    return {
        "response": response
    }
