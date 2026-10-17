from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
from werkzeug.utils import secure_filename
import os
import base64
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

app = Flask(__name__)
CORS(app)
MODEL_PATH = 'brain_tumor_cnn_model.h5'
IMG_SIZE = 128

# Load the trained model
model = tf.keras.models.load_model(MODEL_PATH)

def send_email_with_pdf(to_email, pdf_bytes):
    # Configure your SMTP server and credentials
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SMTP_USER = 'dipirawat830@gmail.com' 
    SMTP_PASS = 'pwun usei fhaa ynis'

    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = 'Brain Tumor Prediction Report'
    body = 'Please find attached your brain tumor prediction report.'
    msg.attach(MIMEText(body, 'plain'))
    part = MIMEApplication(pdf_bytes, Name='brain_tumor_report.pdf')
    part['Content-Disposition'] = 'attachment; filename="brain_tumor_report.pdf"'
    msg.attach(part)
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print('Email send error:', e)
        return False

@app.route('/predict', methods=['POST'])
def predict():
    files = request.files.getlist('file')
    results = []
    # If only email and pdf_base64 are sent (no files), just send the email
    if not files or (len(files) == 1 and files[0].filename == ''):
        email_sent = False
        if 'email' in request.form and request.form['email'] and 'pdf_base64' in request.form:
            to_email = request.form['email']
            pdf_base64 = request.form.get('pdf_base64')
            if pdf_base64:
                if pdf_base64.startswith('data:application/pdf;base64,'):
                    pdf_base64 = pdf_base64.split(',', 1)[1]
                pdf_bytes = base64.b64decode(pdf_base64)
                with open('debug_report.pdf', 'wb') as f:
                    f.write(pdf_bytes)
                email_sent = send_email_with_pdf(to_email, pdf_bytes)
            return jsonify({'email_sent': email_sent})
        return jsonify({'error': 'No file(s) uploaded'}), 400
    for file in files:
        filename = secure_filename(file.filename)
        file_path = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(file_path)
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            results.append({'diagnosis': 'Invalid image', 'confidence': 0.0})
            continue
        # Apply median blur for noise cancellation
        img = cv2.medianBlur(img, 5)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img / 255.0
        img = np.expand_dims(img, axis=(0, -1))
        pred = model.predict(img)[0][0]
        result = 'Tumor' if pred > 0.5 else 'No Tumor'
        confidence = float(pred) if pred > 0.5 else float(1 - pred)
        results.append({'diagnosis': result, 'confidence': round(confidence, 3)})
    # Email logic (for batch, send only first PDF if provided)
    email_sent = False
    if 'email' in request.form and request.form['email']:
        to_email = request.form['email']
        pdf_base64 = request.form.get('pdf_base64')
        if pdf_base64:
            # If the PDF is a data URL, strip the prefix BEFORE decoding
            if pdf_base64.startswith('data:application/pdf;base64,'):
                pdf_base64 = pdf_base64.split(',', 1)[1]
            pdf_bytes = base64.b64decode(pdf_base64)
            # Save PDF for debugging (optional)
            with open('debug_report.pdf', 'wb') as f:
                f.write(pdf_bytes)
            email_sent = send_email_with_pdf(to_email, pdf_bytes)
    if len(results) == 1:
        return jsonify({'diagnosis': results[0]['diagnosis'], 'confidence': results[0]['confidence'], 'email_sent': email_sent})
    else:
        return jsonify({'results': results, 'email_sent': email_sent})

if __name__ == '__main__':
    app.run(debug=True)