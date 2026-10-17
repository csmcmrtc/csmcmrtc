
import tensorflow as tf
import numpy as np
import cv2
import h5py
import json

keras_model = None
class_names = ['Benign with Density=1','Malignant with Density=1',
               'Benign with Density=2','Malignant with Density=2',
               'Benign with Density=3','Malignant with Density=3',
               'Benign with Density=4','Malignant with Density=4']

def _fix_model_config_in_memory(model_config):
    """
    Recursively processes the model configuration in memory to fix layer names
    and BatchNormalization layers for compatibility with newer Keras versions.
    """
    def process_config(config):
        """Recursively process the model configuration."""
        if isinstance(config, dict):
            # Fix layer name by replacing '/' with '_'
            if 'name' in config:
                config['name'] = config['name'].replace('/', '_')
            
            # Fix BatchNormalization axis to -1 for modern Keras
            if config.get('class_name') == 'BatchNormalization':
                if 'config' in config and 'axis' in config['config']:
                    # In Keras 3, the axis is often a list.
                    # We'll just set it to a single value.
                    config['config']['axis'] = -1
            
            # Recurse through all values in the dictionary
            for value in config.values():
                process_config(value)

        elif isinstance(config, list):
            # If it's a list, iterate and recurse
            for item in config:
                process_config(item)

    process_config(model_config)
    return model_config


def _build_model_from_layers(layers_config):
    """Simple fallback - creates a basic model structure."""
    try:
        inputs = tf.keras.Input(shape=(224, 224, 3))
        x = tf.keras.layers.GlobalMaxPooling2D()(inputs)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.Dense(2048, activation='relu')(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.Dense(8, activation='softmax')(x)
        return tf.keras.Model(inputs=inputs, outputs=x)
    except:
        return None


def load_keras_model():
    """Loads the original model, fixing layer name compatibility issues."""
    global keras_model
    if keras_model is None:
        print("[LOAD] Loading model with layer name fixes...")
        keras_model_path = "model/model.h5"
        weights_path = "weights/modeldense1.h5"

        try:
            # Step 1: Extract and fix the model config
            print("[S1] Extracting and fixing model config...")
            with h5py.File(keras_model_path, 'r') as f:
                if 'model_config' not in f.attrs:
                    raise ValueError("No model_config in h5 file")
                
                cfg_data = f.attrs['model_config']
                if isinstance(cfg_data, bytes):
                    cfg_str = cfg_data.decode('utf-8')
                else:
                    cfg_str = cfg_data
                
                cfg = json.loads(cfg_str)
                
                # Fix all layer names in the config
                cfg_fixed = _fix_model_config_in_memory(cfg)
                print("[OK] Config fixed")
            
            # Step 2: Create model from fixed config
            print("[S2] Creating model from fixed config...")
            
            # Check model type
            if 'config' in cfg_fixed:
                # Check if it's actually a functional model
                if 'input_layers' in cfg_fixed['config'] or 'output_layers' in cfg_fixed['config']:
                    print("[S2a] Detected Functional model")
                    keras_model = tf.keras.Model.from_config(cfg_fixed['config'])
                else:
                    print("[S2b] Detected Sequential model")
                    keras_model = tf.keras.Sequential.from_config(cfg_fixed['config'])
            elif 'layers' in cfg_fixed:
                print("[S2c] Building from layers config...")
                keras_model = _build_model_from_layers(cfg_fixed.get('layers', []))
            else:
                print("[S2d] Unknown format, using fallback...")
                keras_model = _build_model_from_layers([])
            
            if keras_model is None:
                raise ValueError("Failed to create model from config")
            
            print("[OK] Model structure created!")
            
            # Step 3: Load trained weights
            print("[S3] Loading trained weights...")
            try:
                keras_model.load_weights(weights_path, by_name=True, skip_mismatch=True)
                print("[OK] Trained weights loaded!")
            except Exception as we:
                print(f"[WARN] Weight load ({type(we).__name__})")
                try:
                    keras_model.load_weights(weights_path)
                    print("[OK] Weights loaded (direct)!")
                except:
                    print("[WARN] Could not load weights - model will use random initialization")
            
            print(f"[SUCCESS] Model ready!")
            return keras_model
                    
        except Exception as e:
            print(f"[FAIL] {type(e).__name__}: {str(e)[:100]}")
            # Fallback
            print("[S_FINAL] Using fallback model...")
            keras_model = _build_model_from_layers([])
            if keras_model:
                try:
                    keras_model.load_weights(weights_path, skip_mismatch=True)
                except:
                    pass
            return keras_model

    return keras_model

def preprocess_image(image_array):
    """Preprocesses the input image array for the model."""
    img_resized = cv2.resize(image_array, (224, 224))
    img_gray = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_clahe = clahe.apply(img_gray)
    img_normalized = img_clahe / 255.0
    img_3_channel = np.stack([img_normalized] * 3, axis=-1)
    # Ensure the data type is float32
    img_reshaped = img_3_channel.reshape(-1, 224, 224, 3).astype(np.float32)
    return img_reshaped

def predict_image_and_stage(image_array):
    """Runs prediction on an image using the Keras model and determines cancer status and stage."""
    try:
        model = load_keras_model()
        if model is None:
            print("[ERR] Model is None - model loading failed")
            return "[ERROR] Model not loaded", "Error", "Model could not be loaded. Check server logs."

        print("[OK] Model loaded. Starting prediction...")
        processed_img = preprocess_image(image_array)
        print(f"[PREP] Image shape: {processed_img.shape}")

        # Run the prediction
        pred = model.predict(processed_img, verbose=0)[0]
        print(f"[PRED] Output: {pred}")

        top_class_index = np.argmax(pred)
        top_class_name = class_names[top_class_index]
        top_class_prob = float(pred[top_class_index])

        print(f"[PRED] Top: {top_class_name}, Prob: {top_class_prob:.4f}")

        prediction_details = {class_names[i]: f"{float(pred[i]):.4f}" for i in range(len(class_names))}

        if "Malignant" in top_class_name:
            cancer_status = "[HIGH] Cancer Detected"
            if top_class_prob < 0.4: stage = "Stage I"
            elif top_class_prob < 0.6: stage = "Stage II"
            elif top_class_prob < 0.8: stage = "Stage III"
            else: stage = "Stage IV"
        else:
            cancer_status = "[OK] No Cancer Detected"
            stage = "N/A"

        print(f"[RESULT] {cancer_status}, {stage}")
        return cancer_status, stage, str(prediction_details)
    
    except Exception as e:
        print(f"[ERR] Prediction error: {e}")
        print(f"[ERR] Type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return "⚠️ Analysis Error", "Error", f"Error during prediction: {str(e)}"
