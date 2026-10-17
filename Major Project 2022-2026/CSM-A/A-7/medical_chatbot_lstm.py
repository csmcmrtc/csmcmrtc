import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Embedding
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import json
import re
from collections import Counter
import warnings
warnings.filterwarnings('ignore')
import pickle
import os

# Example: after training your model (replace `model` with your actual model variable)
os.makedirs("models", exist_ok=True)
with open("models/chatbot_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model saved at models/chatbot_model.pkl")

class MedicalChatbotLSTM:
    def __init__(self):
        self.model = None
        self.tokenizer = Tokenizer()
        self.label_encoder = LabelEncoder()
        self.max_sequence_length = 50
        self.vocab_size = 1000
        self.embedding_dim = 128
        self.lstm_units = 128
        self.disease_database = self._create_disease_database()
        self.symptom_synonyms = self._create_symptom_synonyms()
        
    def _create_disease_database(self):
        """Create comprehensive disease database with symptoms"""
        return {
            'COVID-19': {
                'symptoms': ['fever', 'cough', 'fatigue', 'shortness of breath', 'loss of taste', 
                           'loss of smell', 'sore throat', 'headache', 'body aches', 'chills'],
                'severity': 'high',
                'description': 'A respiratory illness caused by the SARS-CoV-2 virus.',
                'recommendations': 'Seek medical attention immediately. Practice isolation and contact tracing.'
            },
            'Influenza': {
                'symptoms': ['fever', 'cough', 'fatigue', 'body aches', 'headache', 'sore throat', 
                           'runny nose', 'chills', 'weakness'],
                'severity': 'medium',
                'description': 'A viral infection that attacks your respiratory system.',
                'recommendations': 'Rest, stay hydrated, and consider antiviral medications if diagnosed early.'
            },
            'Common Cold': {
                'symptoms': ['runny nose', 'sore throat', 'cough', 'congestion', 'sneezing', 
                           'mild fever', 'fatigue'],
                'severity': 'low',
                'description': 'A viral infection of the upper respiratory tract.',
                'recommendations': 'Rest, stay hydrated, and use over-the-counter medications for symptom relief.'
            },
            'Pneumonia': {
                'symptoms': ['fever', 'cough', 'shortness of breath', 'chest pain', 'fatigue', 
                           'sweating', 'chills', 'loss of appetite'],
                'severity': 'high',
                'description': 'Infection that inflames the air sacs in one or both lungs.',
                'recommendations': 'Seek immediate medical attention. May require hospitalization.'
            },
            'Bronchitis': {
                'symptoms': ['cough', 'mucus production', 'fatigue', 'mild fever', 'chest discomfort', 
                           'shortness of breath'],
                'severity': 'medium',
                'description': 'Inflammation of the bronchial tubes that carry air to the lungs.',
                'recommendations': 'Rest, stay hydrated, and consider seeing a doctor if symptoms persist.'
            },
            'Strep Throat': {
                'symptoms': ['sore throat', 'difficulty swallowing', 'fever', 'headache', 'fatigue', 
                           'swollen lymph nodes', 'white patches on throat'],
                'severity': 'medium',
                'description': 'Bacterial infection that causes inflammation and pain in the throat.',
                'recommendations': 'See a doctor for antibiotic treatment. Rest and stay hydrated.'
            },
            'Mononucleosis': {
                'symptoms': ['fatigue', 'sore throat', 'fever', 'swollen lymph nodes', 'headache', 
                           'body aches', 'loss of appetite'],
                'severity': 'medium',
                'description': 'Viral infection caused by Epstein-Barr virus.',
                'recommendations': 'Rest, stay hydrated, and avoid contact sports. May take weeks to recover.'
            },
            'Dengue Fever': {
                'symptoms': ['high fever', 'severe headache', 'pain behind eyes', 'joint and muscle pain', 
                           'fatigue', 'nausea', 'vomiting', 'skin rash'],
                'severity': 'high',
                'description': 'Mosquito-borne viral infection.',
                'recommendations': 'Seek immediate medical attention. Rest and stay hydrated.'
            },
            'Malaria': {
                'symptoms': ['fever', 'chills', 'headache', 'muscle aches', 'fatigue', 'nausea', 
                           'vomiting', 'sweating'],
                'severity': 'high',
                'description': 'Parasitic disease transmitted by mosquitoes.',
                'recommendations': 'Seek immediate medical attention. Requires specific antimalarial treatment.'
            },
            'Tuberculosis': {
                'symptoms': ['persistent cough', 'coughing up blood', 'chest pain', 'fatigue', 
                           'weight loss', 'night sweats', 'fever', 'loss of appetite'],
                'severity': 'high',
                'description': 'Bacterial infection that primarily affects the lungs.',
                'recommendations': 'Seek immediate medical attention. Requires long-term antibiotic treatment.'
            }
        }
    
    def _create_symptom_synonyms(self):
        """Create symptom synonyms for better text matching"""
        return {
            'fever': ['fever', 'high temperature', 'hot', 'burning up', 'temperature', 'pyrexia'],
            'cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'hacking cough', 'productive cough'],
            'fatigue': ['fatigue', 'tired', 'exhausted', 'weak', 'lethargic', 'run down', 'tiredness'],
            'headache': ['headache', 'head pain', 'migraine', 'head ache', 'cephalalgia'],
            'sore throat': ['sore throat', 'throat pain', 'scratchy throat', 'throat irritation', 'pharyngitis'],
            'shortness of breath': ['shortness of breath', 'difficulty breathing', 'breathless', 
                                  "can't breathe", 'trouble breathing', 'dyspnea'],
            'body aches': ['body aches', 'muscle pain', 'joint pain', 'aches', 'sore muscles', 'myalgia'],
            'runny nose': ['runny nose', 'nasal discharge', 'dripping nose', 'stuffy nose', 'rhinorrhea'],
            'chills': ['chills', 'shivering', 'cold', 'goosebumps', 'rigors'],
            'nausea': ['nausea', 'sick to stomach', 'queasy', 'upset stomach', 'nauseous'],
            'vomiting': ['vomiting', 'throwing up', 'puking', 'sick', 'emesis'],
            'chest pain': ['chest pain', 'chest discomfort', 'chest tightness', 'thoracic pain'],
            'loss of appetite': ['loss of appetite', 'not hungry', 'no appetite', "can't eat", 'anorexia'],
            'night sweats': ['night sweats', 'sweating at night', 'night perspiration'],
            'weight loss': ['weight loss', 'losing weight', 'unintentional weight loss'],
            'skin rash': ['skin rash', 'rash', 'red spots', 'skin irritation', 'dermatitis']
        }
    
    def generate_training_data(self, num_samples=10000):
        """Generate synthetic training data for the LSTM model"""
        print("Generating training data...")
        
        texts = []
        labels = []
        
        for disease, info in self.disease_database.items():
            symptoms = info['symptoms']
            
            # Generate multiple variations for each disease
            for _ in range(num_samples // len(self.disease_database)):
                # Create symptom combinations
                num_symptoms = np.random.randint(2, min(6, len(symptoms) + 1))
                selected_symptoms = np.random.choice(symptoms, num_symptoms, replace=False)
                
                # Create natural language text
                text_variations = self._create_text_variations(selected_symptoms)
                
                for text in text_variations:
                    texts.append(text)
                    labels.append(disease)
        
        # Add some negative samples (no clear disease)
        negative_texts = [
            "I feel fine today",
            "Just a little tired",
            "Minor headache",
            "Slight discomfort",
            "Feeling okay",
            "No major issues",
            "Just need some rest",
            "Feeling a bit off"
        ]
        
        for text in negative_texts:
            texts.append(text)
            labels.append('No Disease')
        
        return texts, labels
    
    def _create_text_variations(self, symptoms):
        """Create natural language variations of symptom descriptions"""
        variations = []
        
        # Template-based variations
        templates = [
            "I have {} and {}",
            "Experiencing {} with {}",
            "Suffering from {} and {}",
            "Feeling {} and {}",
            "Having {} along with {}",
            "I'm experiencing {} and {}",
            "Symptoms include {} and {}",
            "I feel {} and {}"
        ]
        
        # Create variations with different symptom combinations
        for i in range(len(symptoms)):
            for j in range(i + 1, len(symptoms)):
                for template in templates:
                    text = template.format(symptoms[i], symptoms[j])
                    variations.append(text.lower())
        
        # Add single symptom descriptions
        for symptom in symptoms:
            variations.extend([
                f"I have {symptom}",
                f"Experiencing {symptom}",
                f"Suffering from {symptom}",
                f"Feeling {symptom}",
                f"Having {symptom}",
                f"I'm experiencing {symptom}",
                f"Symptom: {symptom}",
                f"I feel {symptom}"
            ])
        
        return variations
    
    def preprocess_text(self, texts):
        """Preprocess text data for LSTM model"""
        # Clean text
        cleaned_texts = []
        for text in texts:
            # Convert to lowercase
            text = text.lower()
            # Remove special characters but keep spaces
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            # Remove extra spaces
            text = ' '.join(text.split())
            cleaned_texts.append(text)
        
        # Tokenize
        self.tokenizer.fit_on_texts(cleaned_texts)
        sequences = self.tokenizer.texts_to_sequences(cleaned_texts)
        
        # Pad sequences
        padded_sequences = pad_sequences(sequences, maxlen=self.max_sequence_length, padding='post')
        
        return padded_sequences
    
    def build_lstm_model(self, num_classes):
        """Build LSTM model architecture"""
        model = Sequential([
            Embedding(self.vocab_size, self.embedding_dim, input_length=self.max_sequence_length),
            LSTM(self.lstm_units, return_sequences=True),
            Dropout(0.3),
            LSTM(self.lstm_units // 2),
            Dropout(0.3),
            Dense(128, activation='relu'),
            Dropout(0.3),
            Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train_model(self, epochs=50, batch_size=32):
        """Train the LSTM model"""
        print("Training LSTM model...")
        
        # Generate training data
        texts, labels = self.generate_training_data()
        
        # Preprocess text
        X = self.preprocess_text(texts)
        
        # Encode labels
        y = self.label_encoder.fit_transform(labels)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Build model
        num_classes = len(self.label_encoder.classes_)
        self.model = self.build_lstm_model(num_classes)
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_test, y_test),
            verbose=1
        )
        
        # Evaluate model
        test_loss, test_accuracy = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"\nTest Accuracy: {test_accuracy:.4f}")
        
        return history
    
    def predict_disease(self, text):
        """Predict disease from text input"""
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
        
        # Preprocess input text
        cleaned_text = text.lower()
        cleaned_text = re.sub(r'[^a-zA-Z\s]', '', cleaned_text)
        cleaned_text = ' '.join(cleaned_text.split())
        
        # Tokenize and pad
        sequence = self.tokenizer.texts_to_sequences([cleaned_text])
        padded_sequence = pad_sequences(sequence, maxlen=self.max_sequence_length, padding='post')
        
        # Predict
        prediction = self.model.predict(padded_sequence)
        predicted_class = np.argmax(prediction[0])
        confidence = np.max(prediction[0])
        
        # Get disease name
        disease_name = self.label_encoder.inverse_transform([predicted_class])[0]
        
        return {
            'disease': disease_name,
            'confidence': confidence,
            'probabilities': prediction[0]
        }
    
    def extract_symptoms(self, text):
        """Extract symptoms from text using synonym matching"""
        symptoms = []
        text_lower = text.lower()
        
        for symptom, synonyms in self.symptom_synonyms.items():
            for synonym in synonyms:
                if synonym in text_lower:
                    symptoms.append(symptom)
                    break
        
        return list(set(symptoms))  # Remove duplicates
    
    def analyze_symptoms(self, symptoms):
        """Analyze symptoms and provide disease predictions"""
        predictions = []
        
        for disease_name, disease_info in self.disease_database.items():
            disease_symptoms = set(disease_info['symptoms'])
            user_symptoms = set(symptoms)
            
            # Calculate overlap
            overlap = len(disease_symptoms.intersection(user_symptoms))
            total_disease_symptoms = len(disease_symptoms)
            
            if overlap > 0:
                confidence = overlap / total_disease_symptoms
                predictions.append({
                    'disease': disease_name,
                    'confidence': confidence,
                    'matched_symptoms': list(disease_symptoms.intersection(user_symptoms)),
                    'total_symptoms': total_disease_symptoms,
                    'severity': disease_info['severity'],
                    'description': disease_info['description'],
                    'recommendations': disease_info['recommendations']
                })
        
        # Sort by confidence
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return predictions
    
    def chat_response(self, user_input):
        """Generate chat response based on user input"""
        # Extract symptoms
        symptoms = self.extract_symptoms(user_input)
        
        # Get LSTM prediction
        lstm_prediction = self.predict_disease(user_input)
        
        # Get symptom-based analysis
        symptom_predictions = self.analyze_symptoms(symptoms)
        
        # Combine predictions
        response = self._generate_response(user_input, symptoms, lstm_prediction, symptom_predictions)
        
        return response
    
    def _generate_response(self, user_input, symptoms, lstm_prediction, symptom_predictions):
        """Generate comprehensive response"""
        response = {
            'message': '',
            'disease_predictions': [],
            'extracted_symptoms': symptoms,
            'confidence': 0,
            'recommendations': '',
            'emergency_warning': False
        }
        
        # Check for emergency symptoms
        emergency_symptoms = ['shortness of breath', 'chest pain', 'difficulty breathing', 'unconsciousness']
        has_emergency = any(symptom in symptoms for symptom in emergency_symptoms)
        
        if has_emergency:
            response['emergency_warning'] = True
            response['message'] = "⚠️ EMERGENCY: You're experiencing symptoms that require immediate medical attention. Please call emergency services (911) immediately or go to the nearest emergency room."
            return response
        
        # Generate main response
        if not symptoms:
            response['message'] = "I understand you're not feeling well. Could you please describe your symptoms in more detail? For example, are you experiencing fever, cough, fatigue, or any other specific symptoms?"
        else:
            # Combine LSTM and symptom-based predictions
            combined_predictions = []
            
            # Add LSTM prediction if confidence is high
            if lstm_prediction['confidence'] > 0.3 and lstm_prediction['disease'] != 'No Disease':
                combined_predictions.append({
                    'disease': lstm_prediction['disease'],
                    'confidence': lstm_prediction['confidence'],
                    'source': 'LSTM'
                })
            
            # Add symptom-based predictions
            for pred in symptom_predictions[:3]:  # Top 3
                combined_predictions.append({
                    'disease': pred['disease'],
                    'confidence': pred['confidence'],
                    'source': 'Symptom Analysis',
                    'description': pred['description'],
                    'recommendations': pred['recommendations'],
                    'severity': pred['severity']
                })
            
            # Sort by confidence
            combined_predictions.sort(key=lambda x: x['confidence'], reverse=True)
            
            if combined_predictions:
                top_prediction = combined_predictions[0]
                response['disease_predictions'] = combined_predictions
                response['confidence'] = top_prediction['confidence']
                
                if top_prediction['confidence'] > 0.7:
                    response['message'] = f"Based on your symptoms, there's a strong possibility you might have {top_prediction['disease']}. "
                    if 'description' in top_prediction:
                        response['message'] += f"{top_prediction['description']} "
                    if 'recommendations' in top_prediction:
                        response['recommendations'] = top_prediction['recommendations']
                else:
                    response['message'] = "Based on your symptoms, there are several possibilities:\n\n"
                    for i, pred in enumerate(combined_predictions[:3], 1):
                        response['message'] += f"{i}. {pred['disease']} ({pred['confidence']:.1%} confidence)\n"
                    response['message'] += "\nI recommend consulting with a healthcare provider for proper diagnosis."
            else:
                response['message'] = "I've identified some symptoms that could indicate various conditions. To provide a more accurate assessment, could you tell me more about how long you've been experiencing these symptoms and their severity?"
        
        return response
    
    def save_model(self, filepath):
        """Save the trained model and preprocessing objects"""
        # Save model
        self.model.save(f"{filepath}_model.h5")
        
        # Save tokenizer
        with open(f"{filepath}_tokenizer.pkl", 'wb') as f:
            pickle.dump(self.tokenizer, f)
        
        # Save label encoder
        with open(f"{filepath}_label_encoder.pkl", 'wb') as f:
            pickle.dump(self.label_encoder, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load the trained model and preprocessing objects"""
        # Load model
        self.model = tf.keras.models.load_model(f"{filepath}_model.h5")
        
        # Load tokenizer
        with open(f"{filepath}_tokenizer.pkl", 'rb') as f:
            self.tokenizer = pickle.load(f)
        
        # Load label encoder
        with open(f"{filepath}_label_encoder.pkl", 'rb') as f:
            self.label_encoder = pickle.load(f)
        
        print(f"Model loaded from {filepath}")


def main():
    """Main function to demonstrate the medical chatbot"""
    print("🏥 Medical Chatbot with LSTM Algorithm")
    print("=" * 50)
    
    # Initialize chatbot
    chatbot = MedicalChatbotLSTM()
    
    # Train model (this will take some time)
    print("\nTraining the LSTM model...")
    chatbot.train_model(epochs=20, batch_size=32)  # Reduced epochs for faster training
    
    # Save model
    chatbot.save_model("medical_chatbot_lstm")
    
    # Interactive chat
    print("\n🤖 Chat with the Medical AI Assistant")
    print("Type 'quit' to exit")
    print("-" * 50)
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit', 'bye']:
            print("👋 Thank you for using the Medical AI Assistant!")
            break
        
        if not user_input:
            continue
        
        # Get response
        response = chatbot.chat_response(user_input)
        
        # Display response
        print(f"\n🤖 AI Assistant: {response['message']}")
        
        if response['extracted_symptoms']:
            print(f"\n📋 Extracted Symptoms: {', '.join(response['extracted_symptoms'])}")
        
        if response['disease_predictions']:
            print(f"\n🔍 Disease Predictions:")
            for i, pred in enumerate(response['disease_predictions'][:3], 1):
                print(f"   {i}. {pred['disease']} ({pred['confidence']:.1%} confidence)")
                if 'description' in pred:
                    print(f"      Description: {pred['description']}")
                if 'recommendations' in pred:
                    print(f"      Recommendations: {pred['recommendations']}")
        
        if response['emergency_warning']:
            print(f"\n🚨 {response['message']}")
        
        print("\n" + "-" * 50)


if __name__ == "__main__":
    main()
