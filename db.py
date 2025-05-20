import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

def connect_to_postgres(dbname=None, user=None, password=None, host='localhost', port=5432):
    dbname = dbname or os.getenv('dbname')
    user = user or os.getenv('user_name')
    password = password or os.getenv('password')
    
    try:
        connection = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        print(f"Connected {dbname}")
        return connection
    except Exception as error:
        print(f"Error connecting to PostgreSQL database: {error}")
        return None

