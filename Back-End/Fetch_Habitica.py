import pandas as pd
from datetime import datetime, timedelta
from db import connect_to_postgres

def fetch_user_data(user_id):
    """Fetch all data for a user at once"""
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        # Log latest date in database
        cursor.execute("""
            SELECT MAX(record_date) FROM habitica_records WHERE users_id = %s
        """, [user_id])
        latest_date = cursor.fetchone()[0]
        print(f"Latest date in database for user {user_id}: {latest_date}")

        query = """
            SELECT 
                task_name,
                task_value,
                record_date,
                task_type
            FROM habitica_records 
            WHERE users_id = %s
            AND record_date >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY record_date DESC
        """
        cursor.execute(query, [user_id])
        records = cursor.fetchall()
        
        df = pd.DataFrame(records, columns=['task_name', 'task_value', 'record_date', 'task_type'])
        if not df.empty:
            df['record_date'] = pd.to_datetime(df['record_date'])
            latest_record = df['record_date'].max()
            print(f"Latest record date for user {user_id}: {latest_record}")
        
        return df
    finally:
        cursor.close()
        conn.close()

def filter_and_format_data(df, task_type=None, time_range='month'):
    """Filter DataFrame based on criteria"""
    if df.empty:
        print("Empty dataframe received")  # Debug log
        return {"Keys": [], "Values": [], "Dates": []}
    
    # Apply time filter
    today = pd.Timestamp.today()
    
    if time_range.lower() == 'day':
        # Get the latest date in the dataset
        latest_date = df['record_date'].max()
        if pd.isnull(latest_date):
            return {"Keys": [], "Values": [], "Dates": []}
            
        # Set the threshold to the start of the latest date
        threshold = latest_date.replace(hour=0, minute=0, second=0)
        end_date = threshold + pd.Timedelta(days=1)
        print(f"Fetching latest data for {threshold.date()}")  # Debug log
    elif time_range.lower() == 'month':
        threshold = today - pd.Timedelta(days=30)
        end_date = today
    elif time_range.lower() == 'year':
        threshold = today - pd.Timedelta(days=365)
        end_date = today
    else:
        threshold = today - pd.Timedelta(days=30)
        end_date = today

    # Filter data between threshold and end_date
    filtered_df = df[
        (df['record_date'] >= threshold) & 
        (df['record_date'] < end_date)
    ]
    
    print(f"Filtered data for {time_range}: {len(filtered_df)} records")  # Debug log
    
    if filtered_df.empty:
        print(f"No data found for {time_range} timeframe")  # Debug log
        return {"Keys": [], "Values": [], "Dates": []}

    # Apply task type filter if specified
    if task_type:
        filtered_df = filtered_df[filtered_df['task_type'].str.lower() == task_type.lower()]
        print(f"After task type filter: {len(filtered_df)} records")  # Debug log

    # Get unique tasks
    unique_tasks = filtered_df['task_name'].unique()

    # For daily view, we just need the latest date's data
    if time_range.lower() == 'day':
        date_range = [threshold]
    else:
        date_range = pd.date_range(start=threshold, end=end_date)

    # Prepare data lists
    keys = []
    values = []
    dates = []

    # Iterate through date range and tasks
    for date in date_range:
        for task in unique_tasks:
            # Check if record exists for the current date and task
            record = filtered_df[
                (filtered_df['record_date'].dt.date == date.date()) & 
                (filtered_df['task_name'] == task)
            ]
            
            if not record.empty:
                keys.append(task)
                values.append(record['task_value'].values[0])
                dates.append(date.strftime('%Y-%m-%d'))
            else:
                keys.append(task)
                values.append(0.0)
                dates.append(date.strftime('%Y-%m-%d'))

    return {
        "Keys": keys,
        "Values": [float(v) for v in values],
        "Dates": dates
    }

def fetch_latest_records(user_id, task_type=None, time_range='month'):
    """Main function to fetch and filter data"""
    df = fetch_user_data(user_id)
    return filter_and_format_data(df, task_type, time_range)

def process_habitica_data(df, user_id):
    """Process incoming CSV data and sync with database"""
    if df is None or df.empty:
        print("No data to process")
        return
        
    conn = connect_to_postgres()
    cursor = conn.cursor()
    
    try:
        # Process new records
        records_to_insert = []
        for _, row in df.iterrows():
            try:
                records_to_insert.append((user_id, pd.to_datetime(row['Date']).date(), str(row['Task Name']), str(row['Task Type']), float(row['Value']), str(row['Task ID'])))
            except Exception as e:
                print(f"Error processing row: {e}")
                continue

        # Batch insert new records
        if records_to_insert:
            try:
                cursor.executemany("""
                    INSERT INTO habitica_records 
                    (users_id, record_date, task_name, task_type, task_value, task_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (users_id, task_id, record_date) 
                    DO UPDATE SET task_value = EXCLUDED.task_value
                """, records_to_insert)
                conn.commit()
            except Exception as e:
                print(f"Database insertion error: {e}")
                conn.rollback()
                raise
    except Exception as e:
        print(f"Process error: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

def graph_fetch(task_type=None, user_id=None, time_range='month'):
    """Main function to fetch graph data with time range support"""
    if not user_id:
        return {"Keys": [], "Values": [], "Dates": []}
    return fetch_latest_records(user_id, task_type, time_range)

