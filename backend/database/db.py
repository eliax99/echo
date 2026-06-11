import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está definida. Copia backend/.env.example a backend/.env "
        "y rellena la cadena de conexión de PostgreSQL."
    )

conn = psycopg2.connect(DATABASE_URL)

cursor = conn.cursor()
