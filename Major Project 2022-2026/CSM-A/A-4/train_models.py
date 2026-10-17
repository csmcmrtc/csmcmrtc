import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

# Load the generated dataset
data = pd.read_csv('user_behavior_large.csv')

# Select features for training
features = ['login_time', 'activity_type', 'file_access', 'failed_logins',
           'data_volume_mb', 'usb_usage', 'printer_usage', 'is_weekend', 'hour_of_day']

X = data[features]

# Scale the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Create labels for Random Forest (using risk_score as threshold)
y = (data['risk_score'] > 7).astype(int)

# Train Random Forest
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_scaled, y)

# Train Isolation Forest
isolation_forest = IsolationForest(contamination=0.1, random_state=42)
isolation_forest.fit(X_scaled)

# Train One-Class SVM
svm_model = OneClassSVM(kernel='rbf', nu=0.1)
svm_model.fit(X_scaled)

# Save models
joblib.dump(rf_model, 'random_forest_model.pkl')
joblib.dump(isolation_forest, 'isolation_forest.pkl')
joblib.dump(svm_model, 'svm_model.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("Models trained and saved successfully!")