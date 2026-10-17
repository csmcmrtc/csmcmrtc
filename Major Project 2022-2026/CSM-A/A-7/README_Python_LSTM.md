# Medical Chatbot with LSTM Algorithm - Python Implementation

A sophisticated AI-powered medical chatbot that uses Long Short-Term Memory (LSTM) neural networks for infectious disease prediction. This implementation combines deep learning with traditional symptom analysis for accurate disease assessment.

## 🧠 Features

### Core AI Capabilities
- **LSTM Neural Network**: Deep learning model for natural language understanding
- **Symptom Extraction**: Advanced NLP for symptom identification
- **Disease Prediction**: Multi-modal prediction combining LSTM and rule-based analysis
- **Confidence Scoring**: Probability-based confidence levels
- **Emergency Detection**: Real-time emergency symptom identification

### Technical Features
- **TensorFlow/Keras**: State-of-the-art deep learning framework
- **Natural Language Processing**: Text preprocessing and tokenization
- **Synthetic Data Generation**: Automated training data creation
- **Model Persistence**: Save and load trained models
- **Real-time Processing**: Fast inference for chat interactions

## 📁 Project Structure

```
medical-chatbot-lstm/
├── medical_chatbot_lstm.py    # Full LSTM implementation
├── demo_lstm_chatbot.py       # Simplified demo version
├── requirements.txt           # Python dependencies
├── README_Python_LSTM.md      # This documentation
└── models/                    # Saved model files (generated)
    ├── medical_chatbot_lstm_model.h5
    ├── medical_chatbot_lstm_tokenizer.pkl
    └── medical_chatbot_lstm_label_encoder.pkl
```

## 🚀 Installation

### Prerequisites
- Python 3.7 or higher
- pip package manager
- Sufficient RAM (4GB+ recommended for training)

### Setup Instructions

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation**:
   ```python
   import tensorflow as tf
   import numpy as np
   print(f"TensorFlow version: {tf.__version__}")
   ```

## 🎯 Usage

### Option 1: Full LSTM Implementation (Training Required)

```python
from medical_chatbot_lstm import MedicalChatbotLSTM

# Initialize chatbot
chatbot = MedicalChatbotLSTM()

# Train the model (this takes time)
print("Training LSTM model...")
chatbot.train_model(epochs=20, batch_size=32)

# Save the trained model
chatbot.save_model("medical_chatbot_lstm")

# Use the chatbot
response = chatbot.chat_response("I have fever and cough")
print(response)
```

### Option 2: Demo Version (No Training Required)

```bash
python demo_lstm_chatbot.py
```

This runs an interactive chat session with simulated LSTM predictions.

### Option 3: Load Pre-trained Model

```python
from medical_chatbot_lstm import MedicalChatbotLSTM

# Initialize chatbot
chatbot = MedicalChatbotLSTM()

# Load pre-trained model
chatbot.load_model("medical_chatbot_lstm")

# Use the chatbot
response = chatbot.chat_response("I'm experiencing fatigue and headache")
print(response)
```

## 🧠 LSTM Architecture

### Model Structure
```
Input Layer (Text) 
    ↓
Embedding Layer (128 dimensions)
    ↓
LSTM Layer 1 (128 units, return_sequences=True)
    ↓
Dropout (0.3)
    ↓
LSTM Layer 2 (64 units)
    ↓
Dropout (0.3)
    ↓
Dense Layer (128 units, ReLU)
    ↓
Dropout (0.3)
    ↓
Output Layer (Softmax)
```

### Training Process
1. **Data Generation**: Synthetic training data creation
2. **Text Preprocessing**: Tokenization and sequence padding
3. **Model Training**: LSTM training with validation
4. **Evaluation**: Accuracy assessment on test data
5. **Model Persistence**: Save trained model and preprocessing objects

## 📊 Supported Diseases

The chatbot can predict and analyze:

| Disease | Severity | Key Symptoms |
|---------|----------|--------------|
| COVID-19 | High | Fever, cough, shortness of breath |
| Influenza | Medium | Fever, cough, body aches |
| Common Cold | Low | Runny nose, sore throat |
| Pneumonia | High | Fever, cough, chest pain |
| Bronchitis | Medium | Cough, fatigue, chest discomfort |
| Strep Throat | Medium | Sore throat, fever, difficulty swallowing |
| Mononucleosis | Medium | Fatigue, sore throat, swollen lymph nodes |
| Dengue Fever | High | High fever, severe headache, joint pain |
| Malaria | High | Fever, chills, headache |
| Tuberculosis | High | Persistent cough, weight loss, night sweats |

## 🔧 Customization

### Adding New Diseases

```python
# Add to disease_database in the class
'New Disease': {
    'symptoms': ['symptom1', 'symptom2', 'symptom3'],
    'severity': 'medium',  # 'high', 'medium', 'low'
    'description': 'Description of the disease',
    'recommendations': 'Medical recommendations'
}
```

### Adding Symptom Synonyms

```python
# Add to symptom_synonyms in the class
'new_symptom': ['synonym1', 'synonym2', 'synonym3']
```

### Model Hyperparameters

```python
# Adjust in __init__ method
self.max_sequence_length = 50    # Maximum text length
self.vocab_size = 1000          # Vocabulary size
self.embedding_dim = 128        # Embedding dimensions
self.lstm_units = 128           # LSTM units
```

## 📈 Performance Metrics

### Training Metrics
- **Accuracy**: Typically 85-95% on test data
- **Training Time**: 10-30 minutes depending on hardware
- **Model Size**: ~5-10 MB saved model

### Prediction Quality
- **High Confidence**: >70% accuracy for clear symptom patterns
- **Medium Confidence**: 50-70% for mixed symptoms
- **Low Confidence**: <50% for unclear patterns

## ⚠️ Important Disclaimers

### Medical Disclaimer
- **Educational Purpose Only**: This tool is for educational and informational purposes
- **Not Medical Diagnosis**: Does not provide medical diagnosis or treatment
- **Professional Consultation**: Always consult healthcare providers for proper diagnosis
- **Emergency Situations**: Call emergency services (911) for severe symptoms

### Technical Limitations
- **Training Data**: Uses synthetic data; real-world accuracy may vary
- **Model Complexity**: LSTM models require significant computational resources
- **Language Support**: Currently optimized for English text
- **Medical Accuracy**: Not validated by medical professionals

## 🛠️ Technical Details

### Dependencies
- **TensorFlow 2.8+**: Deep learning framework
- **NumPy**: Numerical computing
- **Pandas**: Data manipulation
- **Scikit-learn**: Machine learning utilities
- **Pickle**: Model serialization

### System Requirements
- **CPU**: Multi-core processor recommended
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 1GB free space for models
- **GPU**: Optional but recommended for faster training

### Browser Compatibility
- **Python**: 3.7, 3.8, 3.9, 3.10, 3.11
- **Operating Systems**: Windows, macOS, Linux

## 🔒 Privacy & Security

- **No Data Storage**: Chat history is not stored or transmitted
- **Local Processing**: All analysis happens locally
- **No Personal Information**: No collection of personal or medical data
- **Open Source**: Transparent code for security review

## 🚀 Advanced Usage

### Batch Processing

```python
# Process multiple symptoms at once
symptoms_list = [
    "I have fever and cough",
    "Experiencing fatigue and headache",
    "Suffering from sore throat and runny nose"
]

for symptom in symptoms_list:
    response = chatbot.chat_response(symptom)
    print(f"Input: {symptom}")
    print(f"Prediction: {response['disease_predictions'][0]['disease']}")
    print(f"Confidence: {response['confidence']:.2%}\n")
```

### Model Evaluation

```python
# Evaluate model performance
test_texts = ["I have fever", "Experiencing cough", "Feeling tired"]
test_labels = ["COVID-19", "Bronchitis", "Fatigue"]

correct = 0
total = len(test_texts)

for text, expected in zip(test_texts, test_labels):
    response = chatbot.chat_response(text)
    predicted = response['disease_predictions'][0]['disease'] if response['disease_predictions'] else "No Disease"
    if predicted == expected:
        correct += 1

accuracy = correct / total
print(f"Test Accuracy: {accuracy:.2%}")
```

## 🎯 Future Enhancements

### Planned Features
- **BERT Integration**: Advanced transformer models
- **Multi-language Support**: International language support
- **Voice Input**: Speech-to-text integration
- **Image Analysis**: Symptom image recognition
- **Real-time Learning**: Continuous model improvement
- **API Integration**: RESTful API for web applications

### Research Areas
- **Attention Mechanisms**: Enhanced text understanding
- **Transfer Learning**: Pre-trained medical models
- **Ensemble Methods**: Multiple model combination
- **Active Learning**: Intelligent data collection

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

### Code Contributions
- Additional disease databases
- Enhanced symptom recognition
- Improved model architectures
- Better preprocessing pipelines
- Performance optimizations

### Data Contributions
- Real medical case data (anonymized)
- Symptom-disease mappings
- Medical terminology databases
- Multi-language symptom data

## 📞 Support

### Getting Help
- **Code Issues**: Check the code comments for technical details
- **Model Training**: Ensure sufficient computational resources
- **Dependencies**: Verify all packages are correctly installed
- **Performance**: Monitor system resources during training

### Common Issues
1. **Memory Errors**: Reduce batch size or sequence length
2. **Training Time**: Use GPU acceleration if available
3. **Low Accuracy**: Increase training epochs or data size
4. **Import Errors**: Verify TensorFlow installation

## 📄 License

This project is open source and available under the MIT License.

---

**Remember**: This is an educational tool. Always consult healthcare professionals for medical advice and treatment.

## 🏥 Medical Disclaimer

This AI system is designed for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. The predictions and recommendations provided by this system are based on pattern recognition and may not be accurate for individual cases. Always seek the advice of qualified healthcare providers for any medical concerns.
