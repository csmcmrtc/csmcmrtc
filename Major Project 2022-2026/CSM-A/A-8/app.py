from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# Global variablekos
model = None
scaler = None
label_encoders = {}
feature_names = []
is_model_trained = False

# Load dataset
def load_dataset():
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(BASE_DIR, 'Dataset', 'Dataset.csv')
        dataset = pd.read_csv(dataset_path)

        dataset.fillna(0, inplace=True)
        dataset['Production'] = dataset['Production'].astype(np.int64)
        return dataset
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

# Preprocess dataset
def preprocess_dataset(dataset):
    global label_encoders, feature_names
    
    # Create label encoders for categorical variables
    categorical_columns = ['State_Name', 'District_Name', 'Season', 'Crop']
    
    for col in categorical_columns:
        if col in dataset.columns:
            le = LabelEncoder()
            dataset[col] = le.fit_transform(dataset[col].astype(str))
            label_encoders[col] = le
    
    # Select features for training
    feature_columns = ['State_Name', 'District_Name', 'Crop_Year', 'Season', 'Crop', 'Area']
    feature_names = feature_columns
    
    X = dataset[feature_columns]
    y = dataset['Production']
    
    return X, y

# Train model
def train_model():
    global model, scaler, is_model_trained
    
    dataset = load_dataset()
    if dataset is None:
        return False, "Failed to load dataset"
    
    try:
        X, y = preprocess_dataset(dataset)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train Random Forest model (better than Decision Tree)
        model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=20)
        model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        is_model_trained = True
        
        # Save model
        joblib.dump(model, 'crop_yield_model.pkl')
        joblib.dump(scaler, 'crop_yield_scaler.pkl')
        joblib.dump(label_encoders, 'crop_yield_encoders.pkl')
        
        return True, {
            'rmse': rmse,
            'r2': r2,
            'training_samples': len(X_train),
            'testing_samples': len(X_test)
        }
        
    except Exception as e:
        return False, f"Error training model: {str(e)}"

# Load saved model
def load_saved_model():
    global model, scaler, label_encoders, is_model_trained
    
    try:
        if os.path.exists('crop_yield_model.pkl'):
            model = joblib.load('crop_yield_model.pkl')
            scaler = joblib.load('crop_yield_scaler.pkl')
            label_encoders = joblib.load('crop_yield_encoders.pkl')
            is_model_trained = True
            return True
        return False
    except:
        return False

# Predict crop yield
def predict_yield(input_data):
    global model, scaler, label_encoders
    
    if not is_model_trained:
        return None, "Model not trained"
    
    try:
        # Encode categorical variables
        for col in ['State_Name', 'District_Name', 'Season', 'Crop']:
            if col in input_data and col in label_encoders:
                if input_data[col] in label_encoders[col].classes_:
                    input_data[col] = label_encoders[col].transform([input_data[col]])[0]
                else:
                    return None, f"Unknown {col}: {input_data[col]}"
        
        # Create feature vector
        features = [input_data.get(col, 0) for col in feature_names]
        features = np.array(features).reshape(1, -1)
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Predict
        production = model.predict(features_scaled)[0]
        
        # Calculate yield per acre
        area = input_data.get('Area', 1)
        if area > 0:
            yield_per_acre = production / area
        else:
            yield_per_acre = 0
        
        return {
            'production_kg': round(production, 2),
            'yield_per_acre': round(yield_per_acre, 2),
            'area_acres': area,
            'prediction_confidence': round(model.score(features_scaled, [production]) * 100, 2)
        }, None
        
    except Exception as e:
        return None, f"Prediction error: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        try:
            # Get form data
            state = request.form['state']
            district = request.form['district']
            crop_year = int(request.form['crop_year'])
            season = request.form['season']
            crop = request.form['crop']
            area = float(request.form['area'])
            
            # Validate inputs
            if area <= 0:
                flash('Area must be greater than 0', 'error')
                return redirect(url_for('predict'))
            
            if crop_year < 1990 or crop_year > 2030:
                flash('Crop year must be between 1990 and 2030', 'error')
                return redirect(url_for('predict'))
            
            # Prepare input data
            input_data = {
                'State_Name': state,
                'District_Name': district,
                'Crop_Year': crop_year,
                'Season': season,
                'Crop': crop,
                'Area': area
            }
            
            # Make prediction
            result, error = predict_yield(input_data)
            
            if error:
                flash(error, 'error')
                return redirect(url_for('predict'))
            
            flash('Prediction completed successfully!', 'success')
            return render_template('prediction_result.html', 
                                prediction=result, 
                                input_data=input_data)
            
        except Exception as e:
            flash(f'Error: {str(e)}', 'error')
            return redirect(url_for('predict'))
    
    return render_template('predict.html')

@app.route('/train', methods=['POST'])
def train():
    try:
        success, result = train_model()
        
        if success:
            flash('Model trained successfully!', 'success')
            return jsonify({'success': True, 'metrics': result})
        else:
            return jsonify({'success': False, 'error': result})
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/states')
def get_states():
    try:
        dataset = load_dataset()
        if dataset is not None:
            states = sorted(dataset['State_Name'].unique())
            return jsonify(states)
        return jsonify([])
    except:
        return jsonify([])

@app.route('/api/districts/<state>')
def get_districts(state):
    try:
        dataset = load_dataset()
        if dataset is not None:
            districts = sorted(dataset[dataset['State_Name'] == state]['District_Name'].unique())
            return jsonify(districts)
        return jsonify([])
    except:
        return jsonify([])

@app.route('/api/crops')
def get_crops():
    try:
        dataset = load_dataset()
        if dataset is not None:
            crops = sorted(dataset['Crop'].unique())
            return jsonify(crops)
        return jsonify([])
    except:
        return jsonify([])

@app.route('/api/seasons')
def get_seasons():
    try:
        dataset = load_dataset()
        if dataset is not None:
            seasons = sorted(dataset['Season'].unique())
            return jsonify(seasons)
        return jsonify([])
    except:
        return jsonify([])

if __name__ == '__main__':
    # Try to load saved model
    load_saved_model()
    
    app.run(debug=True, host='0.0.0.0', port=5000) 
