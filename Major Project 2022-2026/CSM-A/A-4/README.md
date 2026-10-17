# Advanced Insider Threat Detection System

A comprehensive machine learning-based system for detecting insider threats in organizational environments using ensemble methods and real-time monitoring capabilities.

## 🎯 Project Overview

This project implements an advanced insider threat detection system that uses multiple machine learning algorithms to identify suspicious user behavior patterns. The system combines Random Forest, Isolation Forest, and One-Class SVM models to create a robust ensemble detection mechanism.

## 🚀 Features

### Core Detection Capabilities
- **Multi-Model Ensemble**: Combines Random Forest, Isolation Forest, and One-Class SVM for robust threat detection
- **Real-time Risk Assessment**: Calculates risk scores based on multiple behavioral factors
- **Interactive Web Interface**: Streamlit-based dashboard for easy interaction and monitoring
- **Comprehensive Data Visualization**: Multiple chart types for data analysis and model interpretation

### Behavioral Analysis
- **Login Pattern Analysis**: Detects suspicious login times and failed attempts
- **File Access Monitoring**: Tracks unusual file access patterns
- **Data Transfer Analysis**: Monitors data volume and transfer patterns
- **Device Usage Tracking**: Detects USB and printer usage patterns
- **Department-specific Risk Assessment**: Customized risk scoring based on organizational roles

## 📊 Dataset Features

The system analyzes the following user behavior features:

| Feature | Description | Risk Indicators |
|---------|-------------|-----------------|
| `login_time` | Hour of day when user logged in (0-23) | After-hours access (before 7 AM or after 7 PM) |
| `activity_type` | Type of activity (0: normal, 1: suspicious) | Suspicious activity patterns |
| `file_access` | Number of files accessed | High file access (>30 files) |
| `failed_logins` | Number of failed login attempts | Multiple failed attempts (>3) |
| `data_volume_mb` | Volume of data transferred in MB | Large data transfers (>150 MB) |
| `usb_usage` | Whether USB device was used (0: no, 1: yes) | USB device usage |
| `printer_usage` | Whether printer was used (0: no, 1: yes) | Printer usage patterns |
| `is_weekend` | Whether activity occurred on weekend | Weekend activity |
| `hour_of_day` | Hour when activity occurred (0-23) | Unusual timing patterns |

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Major\ Project
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Generate the dataset** (if not already present)
   ```bash
   python generate_realistic_dataset.py
   ```

4. **Train the machine learning models**
   ```bash
   python train_models.py
   ```

5. **Launch the web application**
   ```bash
   streamlit run app.py
   ```

## 📁 Project Structure

```
Major Project/
├── app.py                          # Main Streamlit application
├── train_models.py                 # Model training script
├── generate_dataset.py             # Basic dataset generation
├── generate_realistic_dataset.py   # Advanced dataset generation
├── requirements.txt                # Python dependencies
├── user_behavior_large.csv         # Generated dataset
├── random_forest_model.pkl         # Trained Random Forest model
├── isolation_forest.pkl            # Trained Isolation Forest model
├── svm_model.pkl                   # Trained SVM model
├── scaler.pkl                      # Feature scaler
└── README.md                       # This file
```

## 🤖 Machine Learning Models

### 1. Random Forest Classifier
- **Type**: Supervised learning
- **Purpose**: Binary classification of normal vs. suspicious behavior
- **Features**: 100 trees, feature importance analysis
- **Advantages**: High interpretability, handles mixed data types well

### 2. Isolation Forest
- **Type**: Unsupervised anomaly detection
- **Purpose**: Identifies outliers in user behavior patterns
- **Features**: Contamination rate of 10%, fast training
- **Advantages**: Effective for detecting rare anomalies

### 3. One-Class SVM
- **Type**: Unsupervised anomaly detection
- **Purpose**: Boundary-based anomaly detection
- **Features**: RBF kernel, nu parameter of 0.1
- **Advantages**: Good for high-dimensional data

### Ensemble Method
The system uses a voting mechanism where:
- Each model provides a prediction (0: normal, 1: threat)
- Final decision requires at least 2 out of 3 models to agree
- Risk score is calculated based on multiple behavioral factors

## 🎮 Usage

### Web Interface Navigation

The Streamlit application provides six main sections:

1. **Threat Detection**: Interactive form to input user behavior data and get threat assessment
2. **Threat Analysis**: Timeline and department-wise risk analysis
3. **Data Visualization**: Comprehensive data exploration with multiple chart types
4. **Model Comparison**: Detailed analysis of individual models and their performance
5. **Real-time Monitoring**: Simulated real-time threat monitoring dashboard
6. **Download Dataset**: Access to dataset statistics and download options

### Key Features of the Interface

- **Interactive Sliders**: Easy parameter adjustment for threat detection
- **Real-time Predictions**: Instant threat assessment with detailed explanations
- **Risk Factor Analysis**: Clear identification of contributing risk factors
- **Visual Analytics**: Multiple chart types for comprehensive data analysis
- **Model Interpretability**: Feature importance and model comparison tools

## 📈 Risk Scoring System

The system calculates risk scores based on multiple factors:

| Risk Factor | Score | Description |
|-------------|-------|-------------|
| After-hours login | +2 | Login before 7 AM or after 7 PM |
| Multiple failed logins | +3 | More than 3 failed login attempts |
| High file access | +2 | Access to more than 30 files |
| High data volume | +2 | Data transfer exceeding 150 MB |
| USB device usage | +2 | USB device detected |
| Weekend activity | +1 | Activity on weekends |
| Suspicious activity | +3 | Marked as suspicious activity type |

**Risk Score Scale**: 0-10 (10 being highest risk)

## 🔧 Customization

### Adding New Features
1. Update the `features` list in `app.py`
2. Modify the dataset generation functions
3. Retrain models with new features
4. Update the risk scoring function

### Adjusting Risk Thresholds
Modify the `calculate_risk_score()` function in `app.py` to adjust:
- Risk factor weights
- Threshold values
- Department-specific adjustments

### Model Parameters
Adjust model hyperparameters in `train_models.py`:
- Random Forest: `n_estimators`, `max_depth`
- Isolation Forest: `contamination`, `n_estimators`
- One-Class SVM: `nu`, `kernel`, `gamma`

## 📊 Performance Metrics

The system provides comprehensive performance analysis:

- **Model Agreement Matrix**: Correlation between model predictions
- **Feature Importance**: Random Forest feature rankings
- **Anomaly Score Distributions**: Statistical analysis of model outputs
- **Prediction Comparison**: Side-by-side model performance comparison

## 🔒 Security Considerations

- **Data Privacy**: All data is generated synthetically for demonstration purposes
- **Model Security**: Pre-trained models are included for immediate use
- **Access Control**: Implement proper authentication for production use
- **Data Encryption**: Consider encrypting sensitive behavioral data

## 🚀 Future Enhancements

- **Real-time Data Integration**: Connect to actual organizational data sources
- **Advanced Anomaly Detection**: Implement deep learning models
- **Alert System**: Email/SMS notifications for high-risk activities
- **User Profiling**: Individual user behavior baselines
- **Geographic Analysis**: Location-based risk assessment
- **Temporal Patterns**: Time-series analysis for trend detection

## 📝 Dependencies

```
streamlit==1.24.0
pandas==1.5.3
numpy==1.24.3
scikit-learn==1.2.2
matplotlib==3.7.1
seaborn==0.12.2
joblib==1.2.0
plotly==5.15.0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and research purposes. Please ensure compliance with your organization's data privacy policies when implementing in production environments.

## 📞 Support

For questions or issues:
1. Check the documentation
2. Review the code comments
3. Test with the provided sample data
4. Contact the development team

---

**Note**: This system is designed for demonstration and educational purposes. For production use, ensure proper data privacy compliance and security measures are in place.
