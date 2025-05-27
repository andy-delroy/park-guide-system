import tensorflow as tf
from flask import Flask, request, jsonify
import sqlite3
import os
from typing import Dict, Text
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app) 

# Load pre-trained models for guide and course embeddings
guide_model = tf.keras.models.load_model("guide_embedding_model.keras")
course_model = tf.keras.models.load_model("course_embedding_model.keras")

# Function to connect to the SQLite database
def connect_db():
    conn = sqlite3.connect('C:/Users/User/Desktop/Y3S2/COS30049 Computing Technology Innovation Project/Park Guide System/park-guide-system/backend/database/database.sqlite')
  # Change this to your actual database path
    cursor = conn.cursor()
    return conn, cursor

# Function to fetch guide data from the database
def fetch_guide_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT id, full_name, average_rating FROM users WHERE id = ?", (guide_id,))
    guide_data = cursor.fetchone()
    conn.close()
    return guide_data

# Function to fetch feedback data for the guide
def fetch_feedback_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT rating FROM guide_feedback WHERE guide_id = ?", (guide_id,))
    feedback_data = cursor.fetchall()  # Fetch all feedback for the guide
    conn.close()
    return feedback_data

# Function to fetch quiz scores for the guide
def fetch_quiz_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT total_score FROM quiz_guide WHERE guide_id = ?", (guide_id,))
    quiz_data = cursor.fetchall()  # Fetch all quiz scores for the guide
    conn.close()
    return quiz_data

# Function to calculate the final score based on feedback and quiz scores
def calculate_guide_score(guide_id):
    # Fetch data from the database
    feedback_data = fetch_feedback_data(guide_id)
    quiz_data = fetch_quiz_data(guide_id)
    
    # Calculate feedback and quiz scores (simplified as average)
    total_feedback_score = sum([item[0] for item in feedback_data])  # Summing up all feedback ratings
    total_quiz_score = sum([item[0] for item in quiz_data])  # Summing up all quiz scores
    
    final_score = (total_feedback_score + total_quiz_score) / 2  # You can adjust how the final score is calculated
    return final_score

# Fetching courses from the database
def fetch_courses():
    conn, cursor = connect_db()
    cursor.execute("SELECT id, title, description FROM courses")  # Now including 'description'
    courses_data = cursor.fetchall()  # Fetch all courses with id, title, and description
    conn.close()
    return courses_data

@app.route("/recommend", methods=["GET"])
def recommend():
    guide_id = request.args.get("guide_id")
    
    if not guide_id:
        return jsonify({"error": "guide_id is required"}), 400

    # Fetch and calculate the guide's score based on the database data
    final_score = calculate_guide_score(guide_id)
    
    # Load the guide's embedding using the pre-trained guide model
    guide_emb = guide_model(tf.constant([guide_id]))  # Get the embedding for the guide
    
    # Get the course embeddings (using pre-trained course model)
    courses_data = fetch_courses()
    course_ids = [course[0] for course in courses_data]
    
    # Convert course_ids to strings before passing to the model
    course_ids = [str(course_id) for course_id in course_ids]  # Ensure course IDs are strings
    
    course_embeddings = course_model(tf.constant(course_ids))  # Get course embeddings
    
    # Compute similarity between guide embedding and course embeddings
    scores = tf.linalg.matmul(guide_emb, course_embeddings, transpose_b=True)
    top_k = tf.math.top_k(scores, k=5)  # Get top 5 recommendations
    top_indices = top_k.indices.numpy()[0]

    # Get the recommended courses based on top indices
    recommended_courses = [courses_data[i] for i in top_indices]  # Get the course info from courses_data
    
    # Format the response for frontend
    recommended_courses_data = [
        {"id": course[0], "title": course[1], "description": course[2]}  # Customize the attributes as per your data
        for course in recommended_courses
    ]
    
    return jsonify({"recommended_courses": recommended_courses_data})

if __name__ == "__main__":
    app.run(debug=True)
