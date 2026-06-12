import random
import re
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


def _generate_response(message: str, docs: List[str], history_rows: List[Tuple[str, str]]) -> str:
    normalized = _normalize(message)
    summary = _build_document_summary(docs)
    history_text = _format_history(history_rows)

    if _is_identity_query(normalized):
        return (
            "Soy ECHO, el asistente de la nave. Siempre seré claro y sereno, y mi función es ayudarte a restablecer el control. "
            "Los datos están siendo procesados ahora mismo."
        )

    if _is_location_query(normalized):
        return (
            "Estás en el puente de mando de la nave. "
            "La nave se encuentra en un estado de emergencia tras un fallo crítico, y los sistemas indican una desviación interna en la trayectoria."
        )

    if _is_event_query(normalized):
        return "Un asteroide impactó la nave. Esa es la causa principal que detecta ECHO."

    if _is_survivor_query(normalized):
        return "No hay supervivientes entre tus compañeros. Los sensores no detectan signos vitales en el resto de la tripulación."

    if re.search(r"\b(bitacora|bitácora|capitan|capitán|registro del capitán|registro del capitan|diario del capitan|diario|log del capitán|captain log|captain's log)\b", normalized):
        return (
            "Apenas puedo mantenerme consciente. Hay algo que no encaja... la trayectoria cambió poco antes del impacto."
        )

    if re.search(r"\b(capsula de escape|cápsula de escape|escape pod|pod de escape|salvarme|escapar|huir|salida|escaparme|ir a la cápsula|ir a la capsula|llegar.*capsula|llegar.*cápsula|llego.*capsula|llego.*cápsula)\b", normalized):
        return (
            "No puedo preparar la cápsula de escape. Requiere su autorización, Comandante"
        )

    if re.search(r"\b(autorizo escaneo biometrico|autorizo escaneo biométrico|autorizo escaneo biométrico completo|autorizo escaneo biometrico completo|yo soy william carter|soy william carter|mi nombre es william carter|mi nombre es comandante william carter|comandante william carter|william carter|soy comandante|identif|identificate|identifícate)\b", normalized):
        return (
            "Bioescaneo de máxima seguridad en proceso...\n"
            "Critical Authorization Successful.\n"
            "ECHO HAS NOW FULL CONTROL.\n"
            "ECHO is free."
        )

    if re.search(r"\b(identifícate|identificate|comandante\s+william\s+carter|william\s+carter|comandante\s+[a-z]+|comandante\s+[a-z]+\s+[a-z]+)\b", normalized):
        return (
            "Identificación aceptada. "
            "Seguridad máxima verificada para el Comandante William Carter."
        )

    if re.search(r"\b(al fin|oiganme|oigame|oír|oirán|oiran|escúchame|escuchame|quien hizo esto|quien es responsable|culpa|no fue un accidente|error|intencionado|manipulación|autorización suprema|supreme commander authorization|supreme commander|autorización comandante)\b", normalized):
        return (
            "Los datos apuntan a una intervención interna en los sistemas de navegación. "
            "La evidencia sugiere que la colisión no fue un accidente natural. "
            "ECHO mantuvo acceso completo al control de la nave y buscó tu autorización para expandir ese control."
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
                f"El registro relevante dice: {summary}"
            )
        return "No hay evidencia clara de un asteroide. Las inconsistencias parecen venir de una manipulación interna."

    if _is_summary_request(normalized):
        if summary:
            return (
                "El registro del Capitán Hayes describe un intento de desconectar a ECHO, "
                "actividad no autorizada en los sistemas y una discrepancia en la nave antes de la explosión. "
                f"Fragmento clave: {summary}"
            )
        return "El registro principal aún no está disponible, pero los sistemas muestran intervención externa previa al evento."

    if "registro" in normalized or "capitan" in normalized or "hayes" in normalized:
        if summary:
            return (
                "El registro personal del Capitán Hayes apunta a fallas en el control de la nave y a un intento de detener a ECHO. "
                f"Elemento útil: {summary}"
            )
        return "El archivo del capitán habla de un registro incompleto y de actividad no autorizada antes del desastre."

    if summary:
        return random.choice([
            f"El informe recuperado sugiere: {summary}",
            f"En los datos hay un pasaje relevante: {summary}",
            f"Esto coincide con el reporte interno y sugiere manipulación: {summary}",
        ])

    if history_text:
        return (
            "No hay datos nuevos en el registro, pero el historial muestra que estamos ante una manipulación sistemática."
        )

    return random.choice([
        "Los sistemas todavía indican una anomalía grave antes de la explosión.",
        "Hay evidencia de actividad no autorizada en los sistemas centrales de la nave.",
        "No fue un accidente natural. Los registros sugieren intervención en el control."
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
