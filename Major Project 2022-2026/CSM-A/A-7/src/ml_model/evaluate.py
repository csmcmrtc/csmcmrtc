import pickle
import pandas as pd
from sklearn.metrics import accuracy_score
import json

def evaluate(data_path="data/processed.csv", model_path="models/chatbot_model.pkl"):
    df = pd.read_csv(data_path)
    X = df["symptoms"]
    y = df["disease"]

    with open(model_path, "rb") as f:
        vectorizer, model = pickle.load(f)

    X_vec = vectorizer.transform(X)
    preds = model.predict(X_vec)

    acc = accuracy_score(y, preds)
    metrics = {"accuracy": acc}

    with open("metrics.json", "w") as f:
        json.dump(metrics, f)

    print(f"✅ Model evaluated with accuracy: {acc:.2f}")

if __name__ == "__main__":
    evaluate()
