import tensorflow as tf
import tensorflow_recommenders as tfrs

class TrainingRecommendationModel(tfrs.Model):
    def __init__(self, training_programs, guides):
        super().__init__()

        # Training program embedding model
        self.training_model = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=training_programs, mask_token=None),
            tf.keras.layers.Embedding(len(training_programs) + 1, 64)
        ])

        # Guide embedding model
        self.guide_model = tf.keras.Sequential([
            tf.keras.layers.StringLookup(vocabulary=guides, mask_token=None),
            tf.keras.layers.Embedding(len(guides) + 1, 64)
        ])

        # Ranking model to predict relevance score
        self.rating_model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dense(1)
        ])

        # Task to rank the training programs for a guide
        self.task = tfrs.tasks.Ranking(
            loss=tf.keras.losses.MeanSquaredError(),
            metrics=[tf.keras.metrics.RootMeanSquaredError()]
        )

    def compute_loss(self, features: dict, training=False):
        # Get the embeddings for guides and training programs
        guide_embeddings = self.guide_model(features["guide_id"])
        training_embeddings = self.training_model(features["training_id"])

        # Calculate predicted relevance score for the training program
        x = tf.concat([guide_embeddings, training_embeddings], axis=1)
        rating_predictions = self.rating_model(x)

        return self.task(
            labels=features["score"], 
            predictions=rating_predictions
        )
