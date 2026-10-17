import tensorflow as tf

# Define the paths
keras_model_path = "model/model.h5"
tflite_model_path = "model/model.tflite"

# Load the Keras model
# Note: It's important to load the model with custom objects if it has any.
# Assuming this model is a standard one, we don't need custom_objects.
print("Loading Keras model...")
model = tf.keras.models.load_model(keras_model_path, compile=False)

# It seems weights are loaded separately in the app, so let's mimic that.
# This is unusual, typically weights are part of the model.h5 file saved with model.save()
# If model.save('model.h5') was used, weights are included. If save_weights was used, they are separate.
# The code has `model.load_weights`, so we should ensure the model has weights before conversion.
model.load_weights("weights/modeldense1.h5")
print("Keras model and weights loaded.")

# Convert the model to TensorFlow Lite format
print("Converting to TensorFlow Lite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the TensorFlow Lite model
with open(tflite_model_path, 'wb') as f:
    f.write(tflite_model)

print(f"Model converted and saved to {tflite_model_path}")

# As an optional step, you can also apply quantization to further optimize.
# This is a bit more involved and might require a representative dataset.
# Example of dynamic range quantization:
# converter.optimizations = [tf.lite.Optimize.DEFAULT]
# tflite_quant_model = converter.convert()
# with open('model/model_quant.tflite', 'wb') as f:
#     f.write(tflite_quant_model)
# print("Quantized model also saved.")
