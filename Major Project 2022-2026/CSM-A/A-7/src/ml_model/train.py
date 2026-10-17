import pandas as pd
import pickle
import os
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

def train(data_path="data/processed.csv", model_path="models/chatbot_model.pkl"):
    df = pd.read_csv(data_path)
    X = df["symptoms"]
    y = df["disease"]

    vectorizer = CountVectorizer()
    X_vec = vectorizer.fit_transform(X)

    model = LogisticRegression()
    model.fit(X_vec, y)

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    with open(model_path, "wb") as f:
        pickle.dump((vectorizer, model), f)

    print(f"✅ Model trained and saved to {model_path}")

if __name__ == "__main__":
    train()
