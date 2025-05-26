import pandas as pd
from db_functions import fetch_guides, fetch_trainings, fetch_guide_feedback, fetch_guide_performance, fetch_guide_data

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

        # Compute scores
        feedback_score = sum([feedback[0] for feedback in guide_feedback]) if guide_feedback else 0
        performance_score = sum([performance[0] for performance in guide_performance]) if guide_performance else 0
        average_rating = guide_data[2] if guide_data and guide_data[2] is not None else 0

        # Weighted combination (you can adjust weights)
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
prepare_training_data()
