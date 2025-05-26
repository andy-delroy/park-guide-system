import tensorflow as tf
from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load pre-trained models for guide and training embeddings
guide_model = tf.keras.models.load_model("guidetraining_embedding_model.keras")
training_model = tf.keras.models.load_model("training_embedding_model.keras")

# Connect to SQLite DB
def connect_db():
    conn = sqlite3.connect('C:/Users/Lenovo/Documents/INO_PROJ/park-guide-system/backend/database/database.sqlite')
    cursor = conn.cursor()
    return conn, cursor

# Fetch guide data (optional, for info)
def fetch_guide_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT id, full_name, average_rating FROM users WHERE id = ?", (guide_id,))
    guide_data = cursor.fetchone()
    conn.close()
    return guide_data

# Fetch feedback data for guide
def fetch_feedback_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT rating FROM guide_feedback WHERE guide_id = ?", (guide_id,))
    feedback_data = cursor.fetchall()
    conn.close()
    return feedback_data

# Fetch quiz data for guide
def fetch_quiz_data(guide_id):
    conn, cursor = connect_db()
    cursor.execute("SELECT total_score FROM quiz_guide WHERE guide_id = ?", (guide_id,))
    quiz_data = cursor.fetchall()
    conn.close()
    return quiz_data

# Calculate final guide score
def calculate_guide_score(guide_id):
    feedback_data = fetch_feedback_data(guide_id)
    quiz_data = fetch_quiz_data(guide_id)

    total_feedback_score = sum([item[0] for item in feedback_data]) if feedback_data else 0
    total_quiz_score = sum([item[0] for item in quiz_data]) if quiz_data else 0

    final_score = (total_feedback_score + total_quiz_score) / 2
    return final_score

# Fetch training programs from DB
def fetch_trainings():
    conn, cursor = connect_db()
    cursor.execute("SELECT id, title, description FROM trainings")  # Make sure your table is named trainings
    trainings_data = cursor.fetchall()
    conn.close()
    return trainings_data

@app.route("/recommend_training", methods=["GET"])
def recommend_training():
    guide_id = request.args.get("guide_id")
    if not guide_id:
        return jsonify({"error": "guide_id is required"}), 400

    # Calculate guide score (optional usage, could be extended)
    final_score = calculate_guide_score(guide_id)

    # Get guide embedding
    guide_emb = guide_model(tf.constant([guide_id]))

    # Get training program embeddings
    trainings_data = fetch_trainings()
    training_ids = [str(training[0]) for training in trainings_data]
    training_tensor = tf.constant(training_ids, dtype=tf.string)
    training_emb = training_model(training_tensor)


    # Compute similarity scores
    scores = tf.linalg.matmul(guide_emb, training_emb, transpose_b=True)
    top_k = tf.math.top_k(scores, k=5)
    top_indices = top_k.indices.numpy()[0]

    recommended_trainings = [trainings_data[i] for i in top_indices]

    # Format response
    recommended_data = [
        {"id": training[0], "title": training[1], "description": training[2]}
        for training in recommended_trainings
    ]

    return jsonify({"recommended_trainings": recommended_data})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
