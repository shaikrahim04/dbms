from werkzeug.security import check_password_hash, generate_password_hash
from db import connect_to_postgres
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

def register_user(username, password, email):
    connection = connect_to_postgres(
        os.getenv('dbname'), 
        os.getenv('user_name'), 
        os.getenv('password')
    )
    if connection is None:
        return {"status": "error", "message": "Database connection failed"}
    
    try:
        cursor = connection.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE name = %s", (username,))
        if cursor.fetchone():
            cursor.close()
            connection.close()
            return {
                "status": "error", 
                "error_type": "duplicate_user",
                "message": f"Username '{username}' is already taken. Please choose another username."
            }
        
        # If user doesn't exist, create new user
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (name, password, email) VALUES (%s, %s, %s)",
            (username, hashed_password, email)
        )
        connection.commit()
        cursor.close()
        connection.close()
        return {"status": "success", "message": "Registration successful"}
    except Exception as error:
        print(f"Error registering user: {error}")
        return {
            "status": "error",
            "error_type": "database_error",
            "message": "An error occurred during registration. Please try again."
        }

def login_user(username, password):
    connection = connect_to_postgres(
        os.getenv('dbname'), 
        os.getenv('user_name'), 
        os.getenv('password')
    )
    if connection is None:
        return {"status": "error", "message": "Database connection failed"}
    
    try:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT id, password FROM users WHERE name = %s",
            (username,)
        )
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if result and check_password_hash(result[1], password):
            return {"status": "success", "message": "Login successful", "user_id": result[0]}
        else:
            return {"status": "error", "message": "Invalid username or password"}
    except Exception as error:
        print(f"Error logging in user: {error}")
        return {"status": "error", "message": "Login failed"}

