import pandas as pd
import json
import os

def preprocess(input_path="data/disease_database.json", output_path="data/processed.csv"):
    with open(input_path, "r") as f:
        data = json.load(f)

    rows = []
    for disease, info in data.items():
        rows.append({
            "disease": disease,
            "symptoms": " ".join(info["symptoms"]),  # join symptoms into text
            "severity": info["severity"]
        })

    df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"✅ Preprocessed data saved to {output_path}")

if __name__ == "__main__":
    preprocess()
