import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

conn = psycopg2.connect(
    dbname="postgres",
    user="postgres.usrcluwbupnhujdbimbg",
    password="amodelCoD99@",
    host="aws-0-eu-west-1.pooler.supabase.com",
    port="6543",
    sslmode="require"
)

cursor = conn.cursor()