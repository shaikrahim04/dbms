from flask import Blueprint, jsonify, request
from db import connect_to_postgres
from api_page import token_required
from datetime import datetime, timedelta

gym_bp = Blueprint('gym', __name__)

@gym_bp.route('/user/gym', methods=['POST'])
@token_required
def add_gym_record(current_user_id):
    data = request.get_json()
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    exercise_title = data.get('exercise_title')
    exercise_notes = data.get('exercise_notes')
    
    if not all([start_time, end_time, exercise_title]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid datetime format"}), 400
        
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO gym_records 
            (users_id, start_time, end_time, exercise_title, exercise_notes)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING gym_record_id
        """, (current_user_id, start_time, end_time, exercise_title, exercise_notes))
        
        record_id = cursor.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Gym record saved", "id": record_id}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@gym_bp.route('/user/gym', methods=['GET'])
@token_required
def get_gym_records(current_user_id):
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT start_time, end_time, exercise_title, exercise_notes
            FROM gym_records
            WHERE users_id = %s
            ORDER BY start_time DESC
            LIMIT 30
        """, (current_user_id,))
        
        records = cursor.fetchall()
        result = [{
            "start_time": r[0].isoformat(),
            "end_time": r[1].isoformat(),
            "exercise_title": r[2],
            "exercise_notes": r[3]
        } for r in records]
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@gym_bp.route('/user/gym/week', methods=['GET'])
@token_required
def get_weekly_gym(current_user_id):
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        cursor.execute("""
            SELECT DATE(start_time), 
                   COUNT(*) as workout_count,
                   SUM(EXTRACT(EPOCH FROM (end_time - start_time)))/3600 as total_hours
            FROM gym_records
            WHERE users_id = %s 
            AND start_time >= %s
            GROUP BY DATE(start_time)
            ORDER BY DATE(start_time)
        """, (current_user_id, start_date))
        
        records = cursor.fetchall()
        
        # Create date range with zeros for missing dates
        date_range = {
            (start_date + timedelta(days=x)).strftime('%Y-%m-%d'): 0 
            for x in range(8)
        }
        
        # Fill in actual values
        for record in records:
            date_str = record[0].strftime('%Y-%m-%d')
            if date_str in date_range:
                date_range[date_str] = float(record[2])  # Use hours spent
        
        result = {
            "dates": list(date_range.keys()),
            "hours": list(date_range.values())
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in get_weekly_gym: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
