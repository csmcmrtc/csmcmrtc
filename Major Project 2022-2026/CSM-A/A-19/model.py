import os
import requests

def download_model():
    # IMPORTANT: Replace this with the actual URL to your model.h5 file.
    url = "https://example.com/path/to/model/model.h5"
    model_path = "model/model.h5"

    if os.path.exists(model_path):
        print(f"Model file already exists at {model_path}. Skipping download.")
        return

    if not os.path.exists(os.path.dirname(model_path)):
        os.makedirs(os.path.dirname(model_path))

    print(f"Downloading model from {url}...")
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(model_path, 'wb') as f:
            f.write(response.content)
        print("Model downloaded successfully.")
    else:
        raise Exception(f"Failed to download model from the URL provided. Status code: {response.status_code}")