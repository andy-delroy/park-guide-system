# tfrs_recommender.py

import tensorflow as tf
import tensorflow_recommenders as tfrs
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
import os
from typing import Dict, Text
from flask_cors import CORS

app = Flask(__name__)

CORS(app)  # Enable CORS for all routes

# 1. Load CSV data
feedback_df = pd.read_csv("guide_feedback.csv")
quiz_df = pd.read_csv("quiz_guide.csv")
courses_df = pd.read_csv("courses.csv")
users_df = pd.read_csv("users.csv")  # Must include id, role_id, average_rating

# 2. Filter guide users
guides_df = users_df[users_df["role_id"] == 2][["id", "average_rating"]].copy()
guides_df = guides_df.rename(columns={"id": "guide_id"})
guides_df["guide_id"] = guides_df["guide_id"].astype(str)
guides_df["average_rating"] = guides_df["average_rating"].fillna(0)

# 3. Compute average quiz score per guide
quiz_scores = quiz_df.groupby("guide_id")["total_score"].mean().reset_index(name="avg_score")
quiz_scores["avg_score"] = quiz_scores["avg_score"] / quiz_scores["avg_score"].max()
quiz_scores["guide_id"] = quiz_scores["guide_id"].astype(str)

# 4. Merge scores with guides
guide_df = pd.merge(guides_df, quiz_scores, on="guide_id", how="left").fillna(0)
guide_df["score"] = (guide_df["average_rating"] + guide_df["avg_score"]) / 2

# 5. Build synthetic interactions with course recommendations
np.random.seed(42)
course_ids = courses_df["id"].astype(str).tolist()
interactions = []
for _, row in guide_df.iterrows():
    for course in np.random.choice(course_ids, 3, replace=False):
        interactions.append({
            "guide_id": row["guide_id"],
            "course_id": course,
            "score": row["score"]
        })
interactions_df = pd.DataFrame(interactions)

# 6. TensorFlow Dataset
ratings = tf.data.Dataset.from_tensor_slices({
    "guide_id": tf.convert_to_tensor(interactions_df["guide_id"].values, dtype=tf.string),
    "course_id": tf.convert_to_tensor(interactions_df["course_id"].values, dtype=tf.string),
    "score": tf.convert_to_tensor(interactions_df["score"].values, dtype=tf.float32),
})
ratings = ratings.shuffle(1000).batch(64).cache()

# 7. Build vocabularies
guide_ids = interactions_df["guide_id"].unique().tolist()
course_ids = courses_df["id"].astype(str).tolist()

# 8. Define TFRS Model
class GuideCourseModel(tfrs.Model):
    def __init__(self):
        super().__init__()
        self.guide_model = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=guide_ids, mask_token=None),
            tf.keras.layers.Embedding(len(guide_ids) + 1, 64)
        ])
        self.course_model = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=course_ids, mask_token=None),
            tf.keras.layers.Embedding(len(course_ids) + 1, 64)
        ])
        self.rating_model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dense(1)
        ])
        self.task = tfrs.tasks.Ranking(
            loss=tf.keras.losses.MeanSquaredError(),
            metrics=[tf.keras.metrics.RootMeanSquaredError()]
        )

    def compute_loss(self, features: Dict[Text, tf.Tensor], training=False) -> tf.Tensor:
        guide_embeddings = self.guide_model(features["guide_id"])
        course_embeddings = self.course_model(features["course_id"])
        x = tf.concat([guide_embeddings, course_embeddings], axis=1)
        rating_predictions = self.rating_model(x)
        return self.task(
            labels=features["score"],
            predictions=rating_predictions
        )

# 9. Train model
if not os.path.exists("guide_embedding_model.keras"):
    model = GuideCourseModel()
    model.compile(optimizer=tf.keras.optimizers.Adagrad(0.1))
    model.fit(ratings, epochs=10)
    model.guide_model.save("guide_embedding_model.keras")
    model.course_model.save("course_embedding_model.keras")
    print("Model training complete.")
else:
    print("Model already trained.")

# 10. Flask API
guide_lookup = tf.keras.models.load_model("guide_embedding_model.keras")
course_lookup = tf.keras.models.load_model("course_embedding_model.keras")
course_embeddings = course_lookup(tf.constant(course_ids))

@app.route("/recommend", methods=["GET"])
def recommend():
    guide_id = request.args.get("guide_id")
    if not guide_id:
        return jsonify({"error": "guide_id is required"}), 400
    
    print(f"Fetching recommendations for guide_id: {guide_id}")

    guide_emb = guide_lookup(tf.constant([guide_id]))
    scores = tf.linalg.matmul(guide_emb, course_embeddings, transpose_b=True)
    top_k = tf.math.top_k(scores, k=5)
    top_indices = top_k.indices.numpy()[0]
    recommended_ids = [course_ids[i] for i in top_indices]

    recommended_courses = courses_df[courses_df["id"].astype(str).isin(recommended_ids)][["id", "title"]]
    return recommended_courses.to_json(orient="records")

if __name__ == "__main__":
    app.run(debug=True)
