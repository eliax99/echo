# models/chat.py

def create_chat_table(cursor):
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id),
        message TEXT,
        response TEXT
    );
    """)