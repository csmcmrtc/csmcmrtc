import streamlit as st
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
import base64
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
import time
import os

def get_file_download_link(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    b64 = base64.b64encode(data).decode()
    href = f'<a href="data:file/csv;base64,{b64}" download="{file_path}">Download CSV File</a>'
    return href

# Load models
@st.cache_resource
def load_models():
    rf_model = joblib.load("random_forest_model.pkl")
    isolation_forest = joblib.load("isolation_forest.pkl")
    svm_model = joblib.load("svm_model.pkl")
    scaler = joblib.load("scaler.pkl")
    return rf_model, isolation_forest, svm_model, scaler

rf_model, isolation_forest, svm_model, scaler = load_models()

# Load data
@st.cache_data
def load_data():
    return pd.read_csv("user_behavior_large.csv")

data = load_data()

# Features
features = ['login_time', 'activity_type', 'file_access', 'failed_logins',
           'data_volume_mb', 'usb_usage', 'printer_usage', 'is_weekend', 'hour_of_day']

# Feature descriptions
feature_descriptions = {
    'timestamp': 'Time when the activity occurred',
    'user_id': 'Unique identifier for each user',
    'login_time': 'Hour of the day when user logged in (0-23)',
    'activity_type': 'Type of activity (0: normal, 1: suspicious)',
    'file_access': 'Number of files accessed',
    'failed_logins': 'Number of failed login attempts',
    'device_id': 'Unique identifier for the device used',
    'ip_address': 'IP address of the device',
    'department': 'Department of the user',
    'data_volume_mb': 'Volume of data transferred in MB',
    'usb_usage': 'Whether USB device was used (0: no, 1: yes)',
    'printer_usage': 'Whether printer was used (0: no, 1: yes)',
    'website_category': 'Category of websites visited',
    'is_weekend': 'Whether activity occurred on weekend (0: no, 1: yes)',
    'hour_of_day': 'Hour when activity occurred (0-23)',
    'risk_score': 'Calculated risk score for the activity'
}

# Ensemble model function
def ensemble_predict(user_data):
    user_data_scaled = scaler.transform([user_data])
    rf_pred = rf_model.predict(user_data_scaled)[0]
    iso_score = isolation_forest.decision_function([user_data])[0]
    svm_pred = svm_model.predict([user_data])[0]
    
    iso_pred = 1 if iso_score < -0.1 else 0
    svm_pred = 1 if svm_pred == -1 else 0
    
    threat_score = rf_pred + iso_pred + svm_pred
    final_prediction = 1 if threat_score >= 2 else 0
    
    return rf_pred, iso_score, svm_pred, final_prediction

# Calculate risk score
def calculate_risk_score(user_data):
    risk_score = 0
    risk_factors = []
    
    if user_data[0] < 7 or user_data[0] > 19:
        risk_score += 2
        risk_factors.append("Suspicious login time")
    
    if user_data[1] == 1:
        risk_score += 3
        risk_factors.append("Suspicious activity detected")
    
    if user_data[2] > 30:
        risk_score += 2
        risk_factors.append("High file access")
    
    if user_data[3] > 3:
        risk_score += 3
        risk_factors.append("Multiple failed logins")
        
    if user_data[4] > 150:
        risk_score += 2
        risk_factors.append("High data volume")
        
    if user_data[5] == 1:
        risk_score += 2
        risk_factors.append("USB device usage detected")
    
    return risk_score, risk_factors

# Streamlit UI
st.title("Advanced Insider Threat Detection System")

# Sidebar
st.sidebar.title("Navigation")
options = st.sidebar.radio("Select a section", 
    ["Threat Detection", "Threat Analysis", "Data Visualization", 
     "Model Comparison", "Real-time Monitoring", "Download Dataset"])

if options == "Threat Detection":
    st.write("### Enter user behavior data to check for threats:")
    
    col1, col2 = st.columns(2)
    
    with col1:
        login_time = st.slider("Login Time", 0, 23, 12)
        activity_type = st.slider("Activity Type (0: normal, 1: suspicious)", 0, 1, 0)
        file_access = st.slider("Number of Files Accessed", 1, 50, 10)
        failed_logins = st.slider("Failed Login Attempts", 0, 9, 1)
        
    with col2:
        data_volume = st.slider("Data Volume (MB)", 0, 500, 50)
        usb_usage = st.checkbox("USB Device Used")
        printer_usage = st.checkbox("Printer Used")
        is_weekend = st.checkbox("Weekend Activity")
    
    user_data = [login_time, activity_type, file_access, failed_logins,
                 data_volume, int(usb_usage), int(printer_usage), 
                 int(is_weekend), datetime.now().hour]
    
    if st.button("Check Threat"):
        rf_pred, iso_score, svm_pred, final_pred = ensemble_predict(user_data)
        risk_score, risk_factors = calculate_risk_score(user_data)
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.write("### Model Predictions")
            st.write(f"Random Forest: {'Threat' if rf_pred == 1 else 'Normal'}")
            st.write(f"Isolation Forest Score: {iso_score:.3f}")
            st.write(f"SVM: {'Threat' if svm_pred == 1 else 'Normal'}")
        
        with col2:
            st.write("### Risk Assessment")
            st.write(f"Risk Score: {risk_score}/10")
            st.write("Risk Factors:")
            for factor in risk_factors:
                st.write(f"- {factor}")
        
        if final_pred == 1:
            st.error("⚠️ High Risk - Potential Insider Threat Detected!")
        else:
            st.success("✅ Normal Behavior Detected")

elif options == "Threat Analysis":
    st.write("### Threat Analysis Dashboard")
    
    st.subheader("Activity Timeline")
    fig = px.line(data, x='timestamp', y='risk_score', 
                  title='Risk Score Timeline')
    st.plotly_chart(fig)
    
    st.subheader("Department-wise Risk Analysis")
    dept_risk = data.groupby('department')['risk_score'].mean().round(2)
    fig = px.bar(dept_risk, title='Average Risk Score by Department')
    st.plotly_chart(fig)

elif options == "Data Visualization":
    st.write("### Data Visualization")
    
    st.subheader("Feature Distributions")
    feature_to_plot = st.selectbox("Select Feature", features)
    fig = px.histogram(data, x=feature_to_plot, title=f'{feature_to_plot} Distribution')
    st.plotly_chart(fig)
    
    st.subheader("Correlation Matrix")
    corr = data[features].corr()
    fig = px.imshow(corr, title='Feature Correlations')
    st.plotly_chart(fig)

    st.write("### User Behavior Data Visualization")

    st.subheader("Feature Distributions")
    fig, ax = plt.subplots(2, 2, figsize=(15, 10))

    sns.histplot(data['login_time'], bins=24, ax=ax[0, 0])
    ax[0, 0].set_title('Login Time Distribution')

    sns.histplot(data['activity_type'], bins=2, ax=ax[0, 1])
    ax[0, 1].set_title('Activity Type Distribution')

    sns.histplot(data['file_access'], bins=50, ax=ax[1, 0])
    ax[1, 0].set_title('File Access Distribution')

    sns.histplot(data['failed_logins'], bins=10, ax=ax[1, 1])
    ax[1, 1].set_title('Failed Logins Distribution')

    st.pyplot(fig)

    st.subheader("Correlation Heatmap")
    plt.figure(figsize=(10, 7))
    sns.heatmap(data[['login_time', 'activity_type', 'file_access', 'failed_logins']].corr(), 
                annot=True, cmap='coolwarm', fmt='.2f', linewidths=0.5)
    st.pyplot(plt.gcf())
    plt.clf()

    st.subheader("Pair Plot")
    pair_plot = sns.pairplot(data[['login_time', 'activity_type', 'file_access', 'failed_logins']])
    st.pyplot(pair_plot.fig)
    plt.clf()

    st.subheader("Box Plots")
    fig, ax = plt.subplots(2, 2, figsize=(15, 10))

    sns.boxplot(x=data['activity_type'], y=data['login_time'], ax=ax[0, 0])
    ax[0, 0].set_title('Login Time by Activity Type')

    sns.boxplot(x=data['activity_type'], y=data['file_access'], ax=ax[0, 1])
    ax[0, 1].set_title('File Access by Activity Type')

    sns.boxplot(x=data['activity_type'], y=data['failed_logins'], ax=ax[1, 0])
    ax[1, 0].set_title('Failed Logins by Activity Type')

    sns.boxplot(x=data['activity_type'], y=data['login_time'], ax=ax[1, 1])
    ax[1, 1].set_title('Login Time Distribution by Activity Type')

    st.pyplot(fig)
    plt.clf()

    st.subheader("Violin Plot")
    plt.figure(figsize=(8, 6))
    sns.violinplot(x=data['activity_type'], y=data['file_access'])
    plt.title("File Access by Activity Type")
    st.pyplot(plt.gcf())
    plt.clf()

    st.subheader("Density Plot (KDE)")
    plt.figure(figsize=(8, 6))
    sns.kdeplot(data=data['login_time'], shade=True, color="blue", label="Login Time")
    sns.kdeplot(data=data['file_access'], shade=True, color="red", label="File Access")
    plt.legend()
    plt.title("KDE Plot of Login Time and File Access")
    st.pyplot(plt.gcf())
    plt.clf()

    st.subheader("Scatter Plot")
    plt.figure(figsize=(8, 6))
    sns.scatterplot(x=data['login_time'], y=data['file_access'], 
                    hue=data['activity_type'], palette="coolwarm")
    plt.title("Login Time vs. File Access")
    st.pyplot(plt.gcf())
    plt.clf()

elif options == "Model Comparison":
    st.write("### Model Performance Comparison")
    
    # Create tabs for different models
    model_tab1, model_tab2, model_tab3, model_tab4 = st.tabs([
        "Random Forest", "Isolation Forest", "SVM", "Model Comparison"
    ])
    
    with model_tab1:
        st.write("### Random Forest Model Analysis")
        
        # Feature importance
        st.subheader("Feature Importance")
        importance = pd.DataFrame({
            'feature': features,
            'importance': rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        fig = px.bar(importance, x='importance', y='feature', 
                     title='Random Forest Feature Importance')
        st.plotly_chart(fig)
        
        # Random Forest predictions distribution
        rf_predictions = rf_model.predict(scaler.transform(data[features]))
        st.subheader("Prediction Distribution")
        fig = px.histogram(rf_predictions, title='Random Forest Predictions Distribution')
        st.plotly_chart(fig)
        
        # Model characteristics
        st.subheader("Model Characteristics")
        st.write(f"Number of Trees: {rf_model.n_estimators}")
        st.write(f"Max Depth: {rf_model.max_depth}")
        st.write(f"Features Used: {rf_model.n_features_in_}")
    
    with model_tab2:
        st.write("### Isolation Forest Model Analysis")
        
        # Anomaly scores
        iso_scores = isolation_forest.decision_function(scaler.transform(data[features]))
        
        # Score distribution
        st.subheader("Anomaly Score Distribution")
        fig = px.histogram(iso_scores, title='Isolation Forest Anomaly Scores',
                          labels={'value': 'Anomaly Score'})
        st.plotly_chart(fig)
        
        # Scatter plot of anomaly scores
        st.subheader("Anomaly Score vs Features")
        feature_for_plot = st.selectbox("Select Feature (Isolation Forest)", features)
        fig = px.scatter(data, x=feature_for_plot, y=iso_scores,
                        title=f'Anomaly Scores vs {feature_for_plot}',
                        labels={'y': 'Anomaly Score'})
        st.plotly_chart(fig)
        
        # Model characteristics
        st.subheader("Model Characteristics")
        st.write(f"Number of Trees: {isolation_forest.n_estimators}")
        st.write(f"Contamination: {isolation_forest.contamination}")
        st.write(f"Features Used: {isolation_forest.n_features_in_}")
    
    with model_tab3:
        st.write("### Support Vector Machine Analysis")
        
        # SVM decision function
        svm_scores = svm_model.decision_function(scaler.transform(data[features]))
        
        # Score distribution
        st.subheader("Decision Function Distribution")
        fig = px.histogram(svm_scores, title='SVM Decision Function Scores',
                          labels={'value': 'Decision Score'})
        st.plotly_chart(fig)
        
        # Scatter plot of decision function
        st.subheader("Decision Function vs Features")
        feature_for_plot_svm = st.selectbox("Select Feature (SVM)", features)
        fig = px.scatter(data, x=feature_for_plot_svm, y=svm_scores,
                        title=f'Decision Scores vs {feature_for_plot_svm}',
                        labels={'y': 'Decision Score'})
        st.plotly_chart(fig)
        
        # Model characteristics
        st.subheader("Model Characteristics")
        st.write(f"Kernel: {svm_model.kernel}")
        st.write(f"Nu Parameter: {svm_model.nu}")
        st.write(f"Features Used: {svm_model.n_features_in_}")
    
    with model_tab4:
        st.write("### Model Comparison Analysis")
        
        # Get predictions from all models
        rf_preds = rf_model.predict(scaler.transform(data[features]))
        iso_preds = isolation_forest.predict(scaler.transform(data[features]))
        svm_preds = svm_model.predict(scaler.transform(data[features]))
        
        # Convert predictions to binary (1 for anomaly, 0 for normal)
        iso_preds = np.where(iso_preds == -1, 1, 0)
        svm_preds = np.where(svm_preds == -1, 1, 0)
        
        # Calculate agreement between models
        agreement_data = pd.DataFrame({
            'Random Forest': rf_preds,
            'Isolation Forest': iso_preds,
            'SVM': svm_preds
        })
        
        # Model agreement matrix
        st.subheader("Model Agreement Matrix")
        agreement_corr = agreement_data.corr()
        fig = px.imshow(agreement_corr,
                       labels=dict(color="Correlation"),
                       title="Model Agreement Correlation Matrix")
        st.plotly_chart(fig)
        
        # Prediction comparison
        st.subheader("Prediction Comparison")
        prediction_counts = pd.DataFrame({
            'Model': ['Random Forest', 'Isolation Forest', 'SVM'],
            'Anomalies Detected': [
                rf_preds.sum(),
                iso_preds.sum(),
                svm_preds.sum()
            ],
            'Normal Behavior': [
                len(rf_preds) - rf_preds.sum(),
                len(iso_preds) - iso_preds.sum(),
                len(svm_preds) - svm_preds.sum()
            ]
        })
        
        fig = px.bar(prediction_counts, x='Model',
                    y=['Anomalies Detected', 'Normal Behavior'],
                    title='Prediction Distribution by Model',
                    barmode='group')
        st.plotly_chart(fig)
        
        # Model characteristics comparison
        st.subheader("Model Characteristics Comparison")
        st.write("""
        | Characteristic | Random Forest | Isolation Forest | SVM |
        |----------------|---------------|------------------|-----|
        | Type | Supervised | Unsupervised | Unsupervised |
        | Approach | Ensemble | Ensemble | Boundary |
        | Training Speed | Moderate | Fast | Slow |
        | Prediction Speed | Fast | Fast | Moderate |
        | Interpretability | High | Moderate | Low |
        """)

elif options == "Real-time Monitoring":
    st.write("### Real-time Threat Monitoring")
    
    if st.button("Start Monitoring"):
        placeholder = st.empty()
        
        for i in range(100):
            with placeholder.container():
                current_time = datetime.now()
                
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.metric("Active Users", np.random.randint(10, 100))
                with col2:
                    st.metric("Threat Level", f"{np.random.randint(1, 100)}%")
                with col3:
                    st.metric("Active Alerts", np.random.randint(0, 10))
                
                chart_data = pd.DataFrame({
                    'time': pd.date_range(start=current_time-timedelta(minutes=10), 
                                        end=current_time, freq='1min'),
                    'threat_level': np.random.rand(11)*100
                })
                
                fig = px.line(chart_data, x='time', y='threat_level',
                             title='Real-time Threat Level')
                st.plotly_chart(fig)
                
                time.sleep(1)

elif options == "Download Dataset":
    st.write("### Download Dataset")
    
    tab1, tab2, tab3 = st.tabs(["Download", "Statistics", "Documentation"])
    
    with tab1:
        st.write("Click below to download the user behavior dataset:")
        st.markdown(get_file_download_link('user_behavior_large.csv'), unsafe_allow_html=True)
        
        file_stats = os.stat('user_behavior_large.csv')
        st.write(f"File size: {file_stats.st_size / (1024*1024):.2f} MB")
        st.write(f"Last modified: {datetime.fromtimestamp(file_stats.st_mtime)}")
    
    with tab2:
        st.write("### Dataset Statistics")
        col1, col2 = st.columns(2)
        
        with col1:
            st.write(f"Total records: {len(data)}")
            st.write(f"Features: {len(data.columns)}")
            st.write(f"Memory usage: {data.memory_usage().sum() / (1024*1024):.2f} MB")
        
        with col2:
            st.write(f"Time range: {data['timestamp'].min()} to {data['timestamp'].max()}")
            st.write(f"Departments: {', '.join(data['department'].unique())}")
        
        st.write("### Basic Statistics")
        st.write(data.describe())
    
    with tab3:
        st.write("### Feature Descriptions")
        for feature, description in feature_descriptions.items():
            st.write(f"**{feature}**: {description}")
        
        st.write("### Data Dictionary")
        st.download_button(
            label="Download Data Dictionary",
            data=pd.DataFrame(feature_descriptions.items(), 
                            columns=['Feature', 'Description']).to_csv(),
            file_name="data_dictionary.csv",
            mime="text/csv"
        )

# Footer
st.markdown("---")
st.markdown("Insider Threat Detection System ")