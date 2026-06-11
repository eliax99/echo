# models/user.py

def create_user_table(cursor):
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT,
        password TEXT NOT NULL
    );
    """)

    # Las tablas creadas por versiones antiguas del código no tienen esta
    # columna y CREATE TABLE IF NOT EXISTS no la añade.
    cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;")