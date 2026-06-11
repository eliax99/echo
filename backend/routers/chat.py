from fastapi import APIRouter, Header, HTTPException
from schemas.chat import ChatRequest
from database.db import cursor, conn
from services.auth_service import jwt
from core.config import SECRET_KEY, ALGORITHM
from agent.agent import run_agent

router = APIRouter(prefix="/api", tags=["chat"])


# -------------------------
# TOKEN → USER ID
# -------------------------
def get_user_id_from_token(authorization: str):
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing token")

        token = authorization.split(" ")[1]

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload["sub"]

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# -------------------------
# CHAT
# -------------------------
@router.post("/chat")
def chat(request: ChatRequest, authorization: str = Header(None)):

    try:
        user_id = get_user_id_from_token(authorization)

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

        result = run_agent(request.message, game_id)
        response = result["response"]

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

    except HTTPException:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass

        raise HTTPException(status_code=500, detail=str(e))


# -------------------------
# HISTORY
# -------------------------
@router.get("/chat/history/{game_id}")
def get_chat_history(game_id: int, authorization: str = Header(None)):

    try:
        user_id = get_user_id_from_token(authorization)

        cursor.execute(
            "SELECT id FROM games WHERE id = %s AND user_id = %s",
            (game_id, user_id)
        )

        if not cursor.fetchone():
            raise HTTPException(status_code=403, detail="Game does not belong to this user")

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

        return {
            "game_id": game_id,
            "history": [
                {"message": r[0], "response": r[1]}
                for r in rows
            ]
        }

    except HTTPException:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    except Exception as e:
        try:
            conn.rollback()
        except Exception:
            pass

        raise HTTPException(status_code=500, detail=str(e))