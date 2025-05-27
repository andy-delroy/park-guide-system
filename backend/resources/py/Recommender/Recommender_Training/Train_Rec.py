import pandas as pd
import tensorflow as tf
import tensorflow_recommenders as tfrs
from db_functions import fetch_guides, fetch_trainings, fetch_guide_feedback, fetch_guide_performance, fetch_guide_data

# 1. Prepare your data
def prepare_training_data():
    guides = fetch_guides()
    trainings = fetch_trainings()

    print(f"Found {len(guides)} guides.")
    print(f"Found {len(trainings)} training programs.")

    training_user_data = []

    for guide in guides:
        guide_id = guide[0]
        guide_data = fetch_guide_data(guide_id)

        guide_feedback = fetch_guide_feedback(guide_id)
        guide_performance = fetch_guide_performance(guide_id)

        feedback_score = sum([f[0] for f in guide_feedback]) if guide_feedback else 0
        performance_score = sum([p[0] for p in guide_performance]) if guide_performance else 0
        average_rating = guide_data[2] if guide_data and guide_data[2] is not None else 0

        final_score = (feedback_score * 0.4 + performance_score * 0.4 + average_rating * 0.2)

        print(f"Guide {guide_id} - Feedback: {feedback_score}, Performance: {performance_score}, AvgRating: {average_rating}, Final Score: {final_score}")

        for training in trainings:
            training_user_data.append({
                "guide_id": str(guide_id),
                "training_id": str(training[0]),
                "score": final_score
            })

    print(f"Prepared {len(training_user_data)} training-user interaction records.")
    return pd.DataFrame(training_user_data)

# 2. Define the recommendation model
class TrainingRecommendationModel(tfrs.Model):
    def __init__(self, training_programs, guides):
        super().__init__()

        self.training_model = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=training_programs, mask_token=None),
            tf.keras.layers.Embedding(len(training_programs) + 1, 64)
        ])

        self.guide_model = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=guides, mask_token=None),
            tf.keras.layers.Embedding(len(guides) + 1, 64)
        ])

        self.rating_model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dense(1)
        ])

        self.task = tfrs.tasks.Ranking(
            loss=tf.keras.losses.MeanSquaredError(),
            metrics=[tf.keras.metrics.RootMeanSquaredError()]
        )

    def compute_loss(self, features, training=False):
        guide_embeddings = self.guide_model(features["guide_id"])
        training_embeddings = self.training_model(features["training_id"])

        x = tf.concat([guide_embeddings, training_embeddings], axis=1)
        rating_predictions = self.rating_model(x)

        return self.task(labels=features["score"], predictions=rating_predictions)

# 3. Main function to run everything
def run_recommendation_system():
    df = prepare_training_data()

    training_programs = df["training_id"].unique().tolist()
    guides = df["guide_id"].unique().tolist()

    tf_dataset = tf.data.Dataset.from_tensor_slices({
        "guide_id": df["guide_id"].values,
        "training_id": df["training_id"].values,
        "score": df["score"].values.astype("float32"),
    })

    tf_dataset = tf_dataset.shuffle(buffer_size=len(df)).batch(32).cache()

    model = TrainingRecommendationModel(training_programs, guides)
    model.compile(optimizer=tf.keras.optimizers.Adagrad(learning_rate=0.1))

    model.fit(tf_dataset, epochs=5)

    # Example: Recommend top 3 trainings for a sample guide
    sample_guide_id = guides[0]
    print(f"\nTop 3 training recommendations for guide {sample_guide_id}:")

    training_ds = tf.data.Dataset.from_tensor_slices(training_programs).batch(32)
    guide_ds = tf.data.Dataset.from_tensors(sample_guide_id).repeat(len(training_programs)).batch(32)

    # Compute scores for all trainings for the sample guide
    scores = []
    for training_batch, guide_batch in zip(training_ds, guide_ds):
        predictions = model.rating_model(
            tf.concat([
                model.guide_model(guide_batch),
                model.training_model(training_batch)
            ], axis=1)
        )
        scores.extend(predictions.numpy().flatten())

    top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:3]

    for idx in top_indices:
        print(f"Training ID: {training_programs[idx]}, Score: {scores[idx]:.3f}")

if __name__ == "__main__":
    run_recommendation_system()
