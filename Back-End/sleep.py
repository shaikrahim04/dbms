from flask import Blueprint, jsonify, request
from db import connect_to_postgres
from api_page import token_required
from datetime import datetime

sleep_bp = Blueprint('sleep', __name__)

@sleep_bp.route('/user/sleep', methods=['POST'])
@token_required
def add_sleep_record(current_user_id):
    data = request.get_json()
    hours = data.get('hours')
    date = data.get('date')
    
    if not all([hours, date]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        hours = int(hours)
        date = datetime.strptime(date, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data format"}), 400
        
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO sleep_records (users_id, hours, record_date)
            VALUES (%s, %s, %s)
            ON CONFLICT (record_date)
            DO UPDATE SET hours = EXCLUDED.hours
            RETURNING sleep_record_id
        """, (current_user_id, hours, date))
        
        record_id = cursor.fetchone()[0]
        conn.commit()
        return jsonify({"message": "Sleep record saved", "id": record_id}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@sleep_bp.route('/user/sleep', methods=['GET'])
@token_required
def get_sleep_records(current_user_id):
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT hours, record_date
            FROM sleep_records
            WHERE users_id = %s
            ORDER BY record_date DESC
            LIMIT 30
        """, (current_user_id,))
        
        records = cursor.fetchall()
        result = [{"hours": r[0], "date": r[1].strftime('%Y-%m-%d')} for r in records]
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@sleep_bp.route('/user/sleep/week', methods=['GET'])
@token_required
def get_weekly_sleep(current_user_id):
    from datetime import datetime, timedelta
    
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        # Calculate date range for the last 7 days
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        
        # Get the latest 7 days of records
        cursor.execute("""
            SELECT record_date, hours
            FROM sleep_records
            WHERE users_id = %s 
            AND record_date BETWEEN %s AND %s
            ORDER BY record_date DESC
        """, (current_user_id, start_date, end_date))
        
        records = cursor.fetchall()
        
        # Create date range with zeros for missing dates
        date_range = {(start_date + timedelta(days=x)).strftime('%Y-%m-%d'): 0 
                     for x in range(7)}
        
        # Fill in actual values
        for record in records:
            date_str = record[0].strftime('%Y-%m-%d')
            if date_str in date_range:
                date_range[date_str] = record[1]
        
        # Sort dates and create response
        sorted_dates = sorted(date_range.keys())
        result = {
            "dates": sorted_dates,
            "hours": [date_range[date] for date in sorted_dates]
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error in get_weekly_sleep: {e}")  # Add logging
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()
