from flask import Blueprint, jsonify, request
from db import connect_to_postgres
import requests
from Fetch_Habitica import (
    graph_fetch, 
    process_habitica_data, 
    fetch_user_data,
    filter_and_format_data
)
from api_page import token_required  # Add this import
import pandas as pd
from io import StringIO
from functools import lru_cache
import time

habitica_bp = Blueprint('habitica', __name__)

def get_habitica_credentials(user_id):
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT api_id, api_key 
        FROM api_records 
        WHERE users_id = %s AND api_type = 'habitica'
        LIMIT 1
    """, (user_id,))
    
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not result:
        return None
    return {"api_id": result[0], "api_key": result[1]}

def fetch_habitica_data(credentials):
    try:
        # Get latest date from database first
        conn = connect_to_postgres()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT MAX(record_date) FROM habitica_records
        """)
        latest_db_date = cursor.fetchone()[0]
        print(f"Latest date in database before fetch: {latest_db_date}")

        api_url = "https://habitica.com/export/history.csv"
        headers = {
            "x-api-user": credentials["api_id"],
            "x-api-key": credentials["api_key"]
        }
        
        response = requests.get(api_url, headers=headers)
        if response.status_code != 200:
            print(f"API Error: {response.status_code}")
            return None
            
        try:
            df = pd.read_csv(StringIO(response.text))
            if df.empty:
                return None

            # Convert and sort dates
            df['Date'] = pd.to_datetime(df['Date'])
            latest_api_date = df['Date'].max()
            print(f"Latest date from Habitica API: {latest_api_date}")
            
            return df
            
        except Exception as e:
            print(f"DataFrame Error: {e}")
            return None
            
    except Exception as e:
        print(f"Request Error: {e}")
        return None
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def process_habitica_data(df, user_id):
    if df is None or df.empty:
        print("No data to process")
        return
        
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        # Get current latest date
        cursor.execute("SELECT MAX(record_date) FROM habitica_records WHERE users_id = %s", [user_id])
        before_date = cursor.fetchone()[0]
        print(f"Latest date in database before insert: {before_date}")

        records_to_insert = []
        for _, row in df.iterrows():
            try:
                record = (
                    user_id,
                    pd.to_datetime(row['Date']).date(),
                    str(row['Task Name']),
                    str(row['Task Type']),
                    float(row['Value']),
                    str(row['Task ID'])
                )
                records_to_insert.append(record)
            except Exception as e:
                print(f"Error processing row: {e}")
                continue

        if records_to_insert:
            cursor.executemany("""
                INSERT INTO habitica_records 
                (users_id, record_date, task_name, task_type, task_value, task_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (users_id, task_id, record_date) 
                DO UPDATE SET task_value = EXCLUDED.task_value
            """, records_to_insert)
            
            conn.commit()
            print(f"Inserted/Updated {len(records_to_insert)} records")

            # Get new latest date
            cursor.execute("SELECT MAX(record_date) FROM habitica_records WHERE users_id = %s", [user_id])
            after_date = cursor.fetchone()[0]
            print(f"Latest date in database after insert: {after_date}")
            
    except Exception as e:
        print(f"Process error: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

@lru_cache(maxsize=100)
def get_cached_user_data(user_id, timestamp):
    """Cache user data for 5 minutes"""
    return fetch_user_data(user_id)

@habitica_bp.route('/user/habitica', methods=['GET'])
@token_required
def get_habitica_stats(current_user_id):
    time_range = request.args.get('time_range', 'month')  # Get from query params
    credentials = get_habitica_credentials(current_user_id)
    if not credentials:
        return jsonify({"error": "No Habitica API credentials found"}), 404
        
    df = fetch_habitica_data(credentials)
    if df is None:
        return jsonify({"error": "Failed to fetch Habitica data"}), 500
        
    try:
        process_habitica_data(df, current_user_id)
        data = graph_fetch(user_id=current_user_id, time_range=time_range)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@habitica_bp.route('/user/habitica/daily', methods=['GET'])
@token_required
def get_habitica_daily(current_user_id):
    time_range = request.args.get('time_range', 'month')
    try:
        # Get cached data or fetch new data
        cache_timestamp = int(time.time() / 300)  # Changes every 5 minutes
        df = get_cached_user_data(current_user_id, cache_timestamp)
        
        data = filter_and_format_data(df, task_type='daily', time_range=time_range)
        return jsonify(data)
    except Exception as e:
        print(f"Daily Route Error: {e}")
        return jsonify({"error": str(e), "Keys": [], "Values": [], "Dates": []}), 500

@habitica_bp.route('/user/habitica/habit', methods=['GET'])
@token_required
def get_habitica_habit(current_user_id):
    time_range = request.args.get('time_range', 'month')
    try:
        # Get cached data or fetch new data
        cache_timestamp = int(time.time() / 300)  # Changes every 5 minutes
        df = get_cached_user_data(current_user_id, cache_timestamp)
        
        data = filter_and_format_data(df, task_type='habit', time_range=time_range)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e), "Keys": [], "Values": [], "Dates": []}), 500
