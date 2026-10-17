import tensorflow as tf

def inspect_model(model_path):
    """
    Loads a Keras model and prints its summary.
    """
    try:
        model = tf.keras.models.load_model(model_path)
        print(f"Model loaded successfully from {model_path}")
        model.summary()
    except Exception as e:
        print(f"Error loading model: {e}")

if __name__ == "__main__":
    inspect_model("model/model.h5")
