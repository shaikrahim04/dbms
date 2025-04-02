from flask import Blueprint, request, jsonify
from db import connect_to_postgres
from functools import wraps
import jwt
from dotenv import load_dotenv
import os

# Change .env to .env.local
load_dotenv('.env.local')

api_bp = Blueprint('api', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, os.getenv('secret_key_jwt'),  algorithms=["HS256"])
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

api_bp = Blueprint('api', __name__)

@api_bp.route('/user/api', methods=['GET', 'POST', 'PUT', 'DELETE'])
@token_required
def handle_api_records(current_user_id, *args, **kwargs):
    conn = connect_to_postgres()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute("""
            SELECT api_record_id, api_type, api_id, api_key 
            FROM api_records 
            WHERE users_id = %s
        """, (current_user_id,))
        records = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify([{
            'id': r[0], 
            'type': r[1], 
            'api_id': r[2], 
            'api_key': r[3]
        } for r in records])

    elif request.method == 'POST':
        data = request.get_json()
        try:
            cursor.execute("""
                INSERT INTO api_records (api_type, users_id, api_id, api_key) 
                VALUES (%s, %s, %s, %s) 
                RETURNING api_record_id
            """, (data['type'], current_user_id, data['api_id'], data['api_key']))
            new_id = cursor.fetchone()[0]
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'id': new_id, 'message': 'API record created successfully'})
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 400

    elif request.method == 'PUT':
        data = request.get_json()
        try:
            cursor.execute("""
                UPDATE api_records 
                SET api_type = %s, api_id = %s, api_key = %s 
                WHERE api_record_id = %s AND users_id = %s
            """, (data['type'], data['api_id'], data['api_key'], data['id'], current_user_id))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'message': 'API record updated successfully'})
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 400

    elif request.method == 'DELETE':
        data = request.get_json()
        try:
            cursor.execute("""
                DELETE FROM api_records 
                WHERE api_record_id = %s AND users_id = %s
            """, (data['id'], current_user_id))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({'message': 'API record deleted successfully'})
        except Exception as e:
            conn.rollback()
            return jsonify({'error': str(e)}), 400
