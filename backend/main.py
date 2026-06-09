# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import conn, cursor

from models.user import create_user_table
from models.game import create_game_table
from models.chat import create_chat_table

from routers import auth, chat


# -------------------------
# APP
# -------------------------
app = FastAPI(title="ECHO API")


# -------------------------
# CORS (CRÍTICO PARA LOVABLE / FRONTEND)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción puedes restringirlo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# INIT DB TABLES
# -------------------------
create_user_table(cursor)
create_game_table(cursor)
create_chat_table(cursor)
conn.commit()


# -------------------------
# ROUTERS
# -------------------------
app.include_router(auth.router)
app.include_router(chat.router)


# -------------------------
# HEALTH CHECK
# -------------------------
@app.get("/")
def root():
    return {"message": "ECHO system online"}