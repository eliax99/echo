from fastapi import APIRouter, Header, HTTPException
from schemas.chat import ChatRequest
from database.db import cursor, conn
from services.auth_service import jwt
from agent.agent import run_agent

router = APIRouter(prefix="/api", tags=["chat"])

# -------------------------
# TOKEN → USER ID
# -------------------------
def get_user_id_from_token(authorization: str):
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, "supersecretkey", algorithms=["HS256"])
        return payload["sub"]
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


# -------------------------
# CHAT ENDPOINT (ECHO IA)
# -------------------------
@router.post("/chat")
def chat(request: ChatRequest, authorization: str = Header(None)):

    try:
        # 1. usuario desde token
        user_id = get_user_id_from_token(authorization)

        # 2. obtener game activo
        cursor.execute(
            """
            SELECT id
            FROM games
            WHERE user_id = %s
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id,)
        )

        game = cursor.fetchone()

        if not game:
            raise HTTPException(status_code=400, detail="No active game found")

        game_id = game[0]

        # 3. IA (ECHO + RAG + LangGraph)
        result = run_agent(request.message, game_id)
        response = result["response"]

        # 4. guardar en base de datos
        cursor.execute(
            """
            INSERT INTO chat_history (game_id, message, response)
            VALUES (%s, %s, %s)
            """,
            (game_id, request.message, response)
        )

        conn.commit()

        return {
            "response": response,
            "game_id": game_id
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# CHAT HISTORY (OBLIGATORIO)
# -------------------------
@router.get("/chat/history/{game_id}")
def get_chat_history(game_id: int, authorization: str = Header(None)):

    try:
        # validar token (simple)
        get_user_id_from_token(authorization)

        cursor.execute(
            """
            SELECT message, response
            FROM chat_history
            WHERE game_id = %s
            ORDER BY id ASC
            """,
            (game_id,)
        )

        rows = cursor.fetchall()

        history = [
            {
                "message": r[0],
                "response": r[1]
            }
            for r in rows
        ]

        return {
            "game_id": game_id,
            "history": history
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))