import sqlite3

def connect_db():
    conn = sqlite3.connect('C:/Users/Lenovo/Documents/INO_PROJ/park-guide-system/backend/database/database.sqlite')  # Your SQLite database path
    cursor = conn.cursor()
    return conn, cursor

def fetch_guides():
    conn, cursor = connect_db()
    cursor.execute("SELECT id, full_name, role_id FROM users WHERE role_id = 2")  # Assuming role_id 2 is for guides
    guides = cursor.fetchall()  # Fetch all guides from the users table
    conn.close()
    return guides

def fetch_trainings():
    conn, cursor = connect_db()
    cursor.execute("SELECT id, title, description FROM trainings")
    training_data = cursor.fetchall()  # Fetch all training programs
    conn.close()
    return training_data

def fetch_guide_feedback(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT rating FROM guide_feedback WHERE guide_id = ?", (guide_id,))
    feedback_data = cursor.fetchall()  # Fetch feedback for the guide
    conn.close()
    return feedback_data

def fetch_guide_performance(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT total_score FROM quiz_guide WHERE guide_id = ?", (guide_id,))
    performance_data = cursor.fetchall()  # Fetch performance data for the guide
    conn.close()
    return performance_data

def fetch_linked_trainings(guide_id):
    conn, cursor = connect_db()
    cursor.execute("""
        SELECT t.id, t.title, t.description 
        FROM trainings t
        JOIN training_user tu ON t.id = tu.training_id
        WHERE tu.user_id = ?
    """, (guide_id,))
    linked_trainings = cursor.fetchall()  # Get the training programs for the guide
    conn.close()
    return linked_trainings

def fetch_guide_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT id, full_name, average_rating FROM users WHERE id = ?", (guide_id,))
    guide_data = cursor.fetchone()
    conn.close()
    return guide_data
