# main.py

from fastapi import FastAPI
from database.db import conn, cursor

from models.user import create_user_table
from models.game import create_game_table
from models.chat import create_chat_table

from routers import auth, chat

app = FastAPI(title="ECHO API")

# crear tablas al arrancar
create_user_table(cursor)
create_game_table(cursor)
create_chat_table(cursor)
conn.commit()

# routers
app.include_router(auth.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "ECHO system online"}