#!/usr/bin/env python3
"""
Demo script for Medical Chatbot with LSTM Algorithm
This script demonstrates the chatbot functionality without training the model
"""

import numpy as np
import re
import json
from collections import Counter

class SimpleMedicalChatbot:
    """Simplified medical chatbot for demonstration"""
 

    def __init__(self, db_path="disease_database.json"):
        # Load disease database from JSON file
        with open(db_path, "r") as f:
            self.disease_database = json.load(f)

        # Keep your symptom synonyms as they are (inside code or move to JSON later)
        self.symptom_synonyms = {
            "fever": ["fever", "high temperature", "hot", "burning up", "temperature"],
            "cough": ["cough", "coughing", "dry cough", "wet cough", "hacking cough"],
            "fatigue": ["fatigue", "tired", "exhausted", "weak", "lethargic", "run down"],
            "headache": ["headache", "head pain", "migraine", "head ache"],
            "sore throat": ["sore throat", "throat pain", "scratchy throat", "throat irritation"],
            "shortness of breath": ["shortness of breath", "difficulty breathing", "breathless", 
                                "can't breathe", "trouble breathing"],
            "body aches": ["body aches", "muscle pain", "joint pain", "aches", "sore muscles"],
            "runny nose": ["runny nose", "nasal discharge", "dripping nose", "stuffy nose"],
            "chills": ["chills", "shivering", "cold", "goosebumps"],
            "chest pain": ["chest pain", "chest discomfort", "chest tightness"],
            "loss of appetite": ["loss of appetite", "not hungry", "no appetite", "can't eat"]
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
        
        return list(set(symptoms))
    
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
    
    def simulate_lstm_prediction(self, text, symptoms):
        """Simulate LSTM prediction based on symptom patterns"""
        # This is a simplified simulation of what an LSTM would predict
        # In the real implementation, this would be the actual LSTM model prediction
        
        if not symptoms:
            return {'disease': 'No Disease', 'confidence': 0.1}
        
        # Simple pattern matching simulation
        symptom_count = len(symptoms)
        
        # Simulate different disease patterns
        if 'fever' in symptoms and 'cough' in symptoms and 'shortness of breath' in symptoms:
            return {'disease': 'COVID-19', 'confidence': 0.85}
        elif 'fever' in symptoms and 'cough' in symptoms and 'body aches' in symptoms:
            return {'disease': 'Influenza', 'confidence': 0.80}
        elif 'runny nose' in symptoms and 'sore throat' in symptoms:
            return {'disease': 'Common Cold', 'confidence': 0.75}
        elif 'cough' in symptoms and 'shortness of breath' in symptoms and 'chest pain' in symptoms:
            return {'disease': 'Pneumonia', 'confidence': 0.90}
        elif 'cough' in symptoms and 'fatigue' in symptoms:
            return {'disease': 'Bronchitis', 'confidence': 0.70}
        else:
            # Generic prediction based on symptom count
            if symptom_count >= 3:
                return {'disease': 'Influenza', 'confidence': 0.60}
            else:
                return {'disease': 'Common Cold', 'confidence': 0.50}
    
    def chat_response(self, user_input):
        """Generate chat response based on user input"""
        # Extract symptoms
        symptoms = self.extract_symptoms(user_input)
        
        # Simulate LSTM prediction
        lstm_prediction = self.simulate_lstm_prediction(user_input, symptoms)
        
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
        emergency_symptoms = ['shortness of breath', 'chest pain', 'difficulty breathing']
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
                    'source': 'LSTM Simulation'
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


def main():
    """Main function to demonstrate the simplified medical chatbot"""
    print("🏥 Medical Chatbot with LSTM Algorithm (Demo)")
    print("=" * 60)
    print("This is a demonstration of the medical chatbot functionality.")
    print("The LSTM prediction is simulated for demo purposes.")
    print("=" * 60)
    
    # Initialize chatbot
    chatbot = SimpleMedicalChatbot()
    
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
                if 'source' in pred:
                    print(f"      Source: {pred['source']}")
                if 'description' in pred:
                    print(f"      Description: {pred['description']}")
                if 'recommendations' in pred:
                    print(f"      Recommendations: {pred['recommendations']}")
        
        if response['emergency_warning']:
            print(f"\n🚨 {response['message']}")
        
        print("\n" + "-" * 50)


if __name__ == "__main__":
    main()
