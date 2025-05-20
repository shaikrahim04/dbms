from flask import Flask, jsonify, request, session, g
from flask_cors import CORS
from auth import register_user, login_user
from db import connect_to_postgres
import jwt
import datetime
from datetime import UTC
from functools import wraps
from api_page import api_bp
from habitica import habitica_bp
from sleep import sleep_bp  # Add sleep blueprint
from dotenv import load_dotenv
import os
from gym import gym_bp  # Add this import

# Load environment variables first
load_dotenv('.env.local')

# Get secrets after loading env vars
secret_key_flask = os.getenv('secret_key_flask')
JWT_SECRET = os.getenv('secret_key_jwt')

if not secret_key_flask or not JWT_SECRET:
    raise RuntimeError("Missing required secret keys in environment variables")

app = Flask(__name__)
app.config['SECRET_KEY'] = secret_key_flask  # Changed from app.secret_key to app.config
cors = CORS(app, origins="*")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            return f(data['user_id'], *args, **kwargs)  # Pass user_id from token
        except:
            return jsonify({'message': 'Token is invalid'}), 401
    return decorated

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    result = register_user(username, password, email)
    return jsonify(result)  # Return the complete result object

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    result = login_user(username, password)
    if result['status'] == 'success':
        token = jwt.encode({
            'user_id': result['user_id'],
            'exp': datetime.datetime.now(UTC) + datetime.timedelta(hours=24)  # Updated this line
        }, JWT_SECRET)
        result['token'] = token
    return jsonify(result)

@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user_id):
    return jsonify({"status": "success", "message": "Logged out successfully"})

app.register_blueprint(api_bp)
app.register_blueprint(habitica_bp)
app.register_blueprint(sleep_bp)
app.register_blueprint(gym_bp)  # Add this line with other blueprints

if __name__ == "__main__":
    app.run(debug=True, port=5000)
