from fastapi import APIRouter, HTTPException
from database.db import cursor, conn
from services.auth_service import hash_password, verify_password, create_access_token
from schemas.user import UserRegister, UserLogin

router = APIRouter(prefix="/auth", tags=["auth"])


# -------------------------
# REGISTER
# -------------------------
@router.post("/register")
def register(user: UserRegister):

    cursor.execute("SELECT * FROM users WHERE email=%s", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    cursor.execute(
        "INSERT INTO users (email, username, password) VALUES (%s, %s, %s)",
        (user.email, user.username, hashed)
    )

    conn.commit()

    return {"message": "User created successfully"}


# -------------------------
# LOGIN + CREATE GAME
# -------------------------
@router.post("/login")
def login(user: UserLogin):

    # buscar usuario
    cursor.execute(
        "SELECT id, email, username, password FROM users WHERE email=%s",
        (user.email,)
    )

    db_user = cursor.fetchone()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    user_id, email, username, db_password = db_user

    # verificar password
    if not verify_password(user.password, db_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # generar token
    token = create_access_token({"sub": str(user_id)})

    # -------------------------
    # CREAR GAME AUTOMÁTICAMENTE
    # -------------------------
    cursor.execute(
        "INSERT INTO games (user_id, status) VALUES (%s, %s) RETURNING id",
        (user_id, "active")
    )

    game_id = cursor.fetchone()[0]
    conn.commit()

    # respuesta
    return {
        "access_token": token,
        "token_type": "bearer",
        "game_id": game_id
    }