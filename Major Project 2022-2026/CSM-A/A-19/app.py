import gradio as gr
import tensorflow as tf
import numpy as np
import datetime
import os
import cv2
from weights import download_weights
from model import download_model
from chatbot.agent import ChatbotAgent

# Load model
def load_model():
    download_model()
    model = tf.keras.models.load_model("model/model.h5")
    model.compile(optimizer=tf.keras.optimizers.legacy.Adam(learning_rate=0.00001, decay=0.0001),
                  metrics=["accuracy"],
                  loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.1))
    download_weights()
    model.load_weights("weights/modeldense1.h5")
    return model

# Initialize Model and Chatbot Agent
model = load_model()
agent = ChatbotAgent()

class_name = ['Benign with Density=1','Malignant with Density=1',
              'Benign with Density=2','Malignant with Density=2',
              'Benign with Density=3','Malignant with Density=3',
              'Benign with Density=4','Malignant with Density=4']

def preprocess_image(image):
    """
    Preprocesses the input image for the breast cancer detection model.

    The pipeline includes:
    1. Resizing to the model's expected input size (224x224).
    2. Converting the image to grayscale, as mammograms are single-channel.
    3. Applying Contrast Limited Adaptive Histogram Equalization (CLAHE) to enhance local contrast.
    4. Normalizing pixel values to the [0, 1] range.
    5. Stacking the grayscale channel to create a 3-channel image for the model.
    6. Reshaping the image to include a batch dimension.
    """
    # Resize and convert to grayscale
    img_resized = cv2.resize(image, (224, 224))
    img_gray = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)

    # Apply CLAHE for contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_clahe = clahe.apply(img_gray)

    # Normalize and prepare for model
    img_normalized = img_clahe / 255.0
    img_3_channel = np.stack([img_normalized] * 3, axis=-1)
    img_reshaped = img_3_channel.reshape(-1, 224, 224, 3)

    return img_reshaped

# Predict image + determine stage
def predict_img(img):
    processed_img = preprocess_image(img)
    pred = model.predict(processed_img)[0]

    top_class_index = np.argmax(pred)
    top_class_name = class_name[top_class_index]
    top_class_prob = float(pred[top_class_index])
    all_predictions = {class_name[i]: f"{float(pred[i]):.4f}" for i in range(len(class_name))}

    # Cancer or not
    if "Malignant" in top_class_name:
        cancer_status = "🔴 Cancer Detected"
        # Dummy rule for stage (can refine with probabilities or medical dataset)
        if top_class_prob < 0.4:
            stage = "Stage I"
        elif top_class_prob < 0.6:
            stage = "Stage II"
        elif top_class_prob < 0.8:
            stage = "Stage III"
        else:
            stage = "Stage IV"
    else:
        cancer_status = "🟢 No Cancer Detected"
        stage = "N/A"

    # --- Generate Report ---
    report_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report_content = f"""
# Breast Cancer Analysis Report
---
### **Summary**
- **Analysis Date:** {report_time}
- **Finding:** {cancer_status}
- **Estimated Stage:** {stage}
- **Primary Classification:** {top_class_name} (Confidence: {top_class_prob:.2%})
---
### **Detailed Prediction Probabilities**
"""
    for cls, prob in all_predictions.items():
        report_content += f"- **{cls}:** {float(prob):.2%}\n"
        
    report_content += """
---
### **Disclaimer**
**This is an educational tool and is NOT a substitute for a professional medical diagnosis.** The predictions made by this AI model are for informational purposes only. Always consult with a qualified radiologist or doctor for any health concerns.
"""
    report_filename = f"report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(report_filename, "w") as f:
        f.write(report_content)

    return cancer_status, stage, report_content, report_filename

# Chatbot response
def chatbot_response(message, history):
    """
    Handles the chatbot interaction by passing the user's message to the advanced ChatbotAgent.
    """
    return agent.get_response(message, history)

# Gradio interface
with gr.Blocks() as demo:
    gr.Markdown("## 🩺 Breast Cancer Detection & AI Assistant")

    with gr.Tab("Prediction"):
        with gr.Row():
            with gr.Column():
                image_input = gr.Image(type="numpy", label="Upload Breast Scan")
                btn = gr.Button("Analyze Image")
            with gr.Column():
                gr.Markdown("### Analysis Results")
                result_status = gr.Textbox(label="Cancer Status", interactive=False)
                result_stage = gr.Textbox(label="Stage", interactive=False)
                download_report_btn = gr.File(label="Download Full Report", interactive=False)
        
        with gr.Row():
            report_output = gr.Markdown(label="Detailed Report")

        btn.click(
            predict_img, 
            inputs=image_input, 
            outputs=[result_status, result_stage, report_output, download_report_btn]
        )

    with gr.Tab("AI Chat Assistant"):
        gr.ChatInterface(fn=chatbot_response)

demo.launch(debug=True, share=True)
