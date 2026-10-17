# Standard library
import os
import json
import datetime
from io import BytesIO
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import pandas as pd
import os
import datetime
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from .models import UploadedDataset, TrainedModel
from .forms import SafeTrainModelForm
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import UploadedDataset, TrainedModel
from .forms import SafeTrainModelForm
import pandas as pd
import numpy as np
import os
import datetime
import joblib
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None  # XGBoost not installed

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

from .forms import RegisterForm, LoginForm
from .models import UserProfile, PatientProfile, UploadedDataset, TrainedModel, PatientHealthRecord, Prediction

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

# Third-party libraries
import pandas as pd
import numpy as np
import joblib
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from sklearn.preprocessing import OneHotEncoder, StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_auc_score
)

# Optional XGBoost
try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

# Django imports
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_POST

# Local app imports (models and forms)
from .models import (
    UserProfile, PatientProfile, PatientHealthRecord, 
    TrainedModel, Prediction, Report, UploadedDataset,
    TrainedModel, UploadedDataset
)
from .forms import (
    RegisterForm, LoginForm, PatientProfileForm, 
    PatientHealthRecordForm, DatasetUploadForm,
    SafeTrainModelForm
)

@login_required
def import_aimed_dataset(request):
    profile = request.user.profile
    if profile.role != 'admin':
        messages.error(request, 'Unauthorized access.')
        return redirect('dashboard')

    if request.method == 'POST':
        form = DatasetUploadForm(request.POST, request.FILES)
        if form.is_valid():
            dataset = form.save(commit=False)
            dataset.owner = request.user
            try:
                # Read CSV to get metadata
                df = pd.read_csv(request.FILES['file'])
                dataset.rows_count = len(df)
                dataset.columns_info = {col: str(df[col].dtype) for col in df.columns}
                dataset.save()

                messages.success(request, 'Dataset imported successfully!')
                return redirect('dashboard')
            except Exception as e:
                messages.error(request, f'Error importing CSV: {e}')
    else:
        form = DatasetUploadForm()

    return render(request, 'core/import_dataset.html', {'form': form})


@login_required
def delete_dataset(request, dataset_id):
    """Allow admin to delete an uploaded dataset."""
    dataset = get_object_or_404(UploadedDataset, id=dataset_id)

    if not request.user.is_superuser and not request.user.profile.role == 'admin':
        messages.error(request, "You are not authorized to delete datasets.")
        return redirect('dashboard')  # ensure this URL exists

    if os.path.exists(dataset.file.path):
        os.remove(dataset.file.path)
    dataset.delete()
    messages.success(request, "Dataset deleted successfully!")
    return redirect('dashboard')
# ==============================
#       HOME & AUTH VIEWS
# ==============================
def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'core/home.html')


# ==============================
#       AUTHENTICATION VIEWS
# ==============================
def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            # Save the user
            user = form.save(commit=False)
            user.email = form.cleaned_data['email']
            user.save()

            # Assign role to UserProfile
            role = form.cleaned_data.get('role', 'patient')
            UserProfile.objects.update_or_create(user=user, defaults={'role': role})

            # Create patient profile if applicable
            if role == 'patient':
                PatientProfile.objects.get_or_create(user=user)

            messages.success(request, '🎉 Account created successfully! Please log in.')
            return redirect('login')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = RegisterForm()

    return render(request, 'core/register.html', {'form': form})


def login_view(request):
    """Handles user login."""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {user.username}!')
                return redirect('dashboard')
            else:
                messages.error(request, '❌ Invalid username or password.')
        else:
            messages.error(request, 'Please fill in all fields correctly.')
    else:
        form = LoginForm()

    return render(request, 'core/login.html', {'form': form})


@login_required
def logout_view(request):
    """Logs the user out and redirects to home."""
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('home')


# ==============================
#           DASHBOARD
# ==============================
@login_required
def dashboard(request):
    profile = request.user.profile

    # === ADMIN DASHBOARD ===
    if profile.role == 'admin':
        datasets = UploadedDataset.objects.filter(owner=request.user)
        models = TrainedModel.objects.filter(owner=request.user)
        total_predictions = Prediction.objects.count()
        return render(request, 'core/admin_dashboard.html', {
            'datasets': datasets,
            'models': models,
            'total_predictions': total_predictions
        })

    # === DOCTOR DASHBOARD ===
    elif profile.role == 'doctor':

        # All records assigned to the doctor
        patients_records = PatientHealthRecord.objects.filter(
            patient__in=Prediction.objects.values("patient")
    )



        # Total Unique Patients
        total_patients = patients_records.values('patient').distinct().count()

        # Fetch ALL predictions
        predictions_qs = Prediction.objects.filter(
            patient__in=patients_records.values('patient')
        )

        # Recent predictions (10)
        recent_predictions = predictions_qs.order_by('-created_at')[:10]

        # High-risk cases
        high_risk_cases = predictions_qs.filter(risk_level__iexact='high').count()

        return render(request, 'core/doctor_dashboard.html', {
            'total_patients': total_patients,
            'recent_predictions': recent_predictions,
            'high_risk_cases': high_risk_cases,
            'patients_records': patients_records,
            'patients': patients_records,
        })

    # === PATIENT DASHBOARD ===
    else:
        health_records = PatientHealthRecord.objects.filter(patient=request.user)
        predictions = Prediction.objects.filter(patient=request.user)

        return render(request, 'core/patient_dashboard.html', {
            'health_records': health_records,
            'predictions': predictions
        })
    

    
@login_required
def upload_dataset(request):
    profile = request.user.profile
    if profile.role != 'admin':
        messages.error(request, 'Unauthorized access.')
        return redirect('dashboard')

    if request.method == 'POST':
        form = DatasetUploadForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                messages.error(request, "No file uploaded.")
                return redirect('upload_dataset')

            # Validate CSV
            if not uploaded_file.name.endswith('.csv'):
                messages.error(request, 'Only CSV files are allowed.')
                return redirect('upload_dataset')

            try:
                df = pd.read_csv(uploaded_file)
            except Exception as e:
                messages.error(request, f'Invalid CSV file: {e}')
                return redirect('upload_dataset')

            # Save Dataset instance
            dataset = form.save(commit=False)
            dataset.owner = request.user
            dataset.filename = uploaded_file.name
            dataset.rows_count = len(df)
            dataset.columns_info = {col: str(df[col].dtype) for col in df.columns}

            # Optional fields (name/description)
            if hasattr(form.fields, 'name') and not form.cleaned_data.get('name'):
                dataset.name = uploaded_file.name.split('/')[-1].replace('.csv', '')
            if hasattr(form.fields, 'description') and not form.cleaned_data.get('description'):
                dataset.description = ''

            dataset.save()
            messages.success(request, f'Dataset "{uploaded_file.name}" uploaded successfully.')
            return redirect('dashboard')
        else:
            messages.error(request, 'Form is invalid. Please try again.')
    else:
        form = DatasetUploadForm()
        # Safely set optional fields
        if 'name' in form.fields:
            form.fields['name'].required = False
        if 'description' in form.fields:
            form.fields['description'].required = False

    return render(request, 'core/upload_dataset.html', {'form': form})
# ==============================
#       PATIENT PROFILE
# ==============================
@login_required
def patient_profile(request):
    profile = request.user.profile

    # Allow only patients
    if profile.role != 'patient':
        messages.error(request, 'Only patients can access this section.')
        return redirect('dashboard')

    # Fetch or create profile
    patient_profile, _ = PatientProfile.objects.get_or_create(user=request.user)

    # Fetch patient-related history & predictions
    health_records = PatientHealthRecord.objects.filter(patient=request.user)
    predictions = Prediction.objects.filter(patient=request.user)

    if request.method == "POST":
        form = PatientProfileForm(request.POST, instance=patient_profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully.")
            return redirect("patient_profile")
    else:
        form = PatientProfileForm(instance=patient_profile)

    return render(
        request,
        "core/patient_profile.html",
        {
            "form": form,
            "health_records": health_records,
            "predictions": predictions,
        },
    )

# ==============================
#       PATIENT HEALTH RECORDS
# ==============================

@login_required
def add_health_record(request):
    profile = request.user.profile
    if profile.role != 'patient':
        messages.error(request, 'Only patients can add health records.')
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = PatientHealthRecordForm(request.POST)
        if form.is_valid():
            record = form.save(commit=False)
            record.patient = request.user
            record.save()
            messages.success(request, 'Health record added successfully.')
            return redirect('predict_disease', record_id=record.id)
    else:
        form = PatientHealthRecordForm()
    
    return render(request, 'core/add_health_record.html', {'form': form})


@login_required
def health_records(request):
    profile = request.user.profile
    if profile.role != 'patient':
        messages.error(request, 'Only patients can view health records.')
        return redirect('dashboard')
    
    records = PatientHealthRecord.objects.filter(patient=request.user)
    return render(request, 'core/health_records.html', {'records': records})
# ==============================
#       DISEASE PREDICTION
# ==============================
@login_required
def predict_disease(request, record_id):
    record = get_object_or_404(PatientHealthRecord, id=record_id)
    models = TrainedModel.objects.all()
    predictions_data = []
    overall_confidence = []

    for model in models:
        try:
            model_data = joblib.load(model.model_file.path)
            ml_model = model_data.get('model')
            feature_columns = model_data.get('feature_columns', [])

            # Prepare patient input
            input_dict = {
                'age': record.age,
                'sex': 1 if record.sex == 'M' else 0,
                'bmi': record.bmi,
                'systolic_bp': record.systolic_bp,
                'diastolic_bp': record.diastolic_bp,
                'heart_rate': record.heart_rate,
            }

            input_df = pd.DataFrame([input_dict])
            for col in feature_columns:
                if col not in input_df.columns:
                    input_df[col] = np.nan

            # Preprocessor handling
            preprocessor = getattr(getattr(ml_model, 'named_steps', {}), 'get', lambda x, y=None: None)('preprocessor', None)
            if preprocessor:
                numeric_features = preprocessor.transformers_[0][2]
                categorical_features = preprocessor.transformers_[1][2]
            else:
                numeric_features = [col for col in input_df.columns if input_df[col].dtype != 'object']
                categorical_features = [col for col in input_df.columns if input_df[col].dtype == 'object']

            for col in numeric_features:
                if col in input_df.columns:
                    input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0.0)
            for col in categorical_features:
                if col in input_df.columns:
                    input_df[col] = input_df[col].astype(str).fillna('Unknown')

            # Reorder columns
            input_df = input_df[feature_columns]

            # Predict
            if hasattr(ml_model, "predict_proba"):
                prediction_prob = float(ml_model.predict_proba(input_df)[0][1])
            else:
                raw_score = float(ml_model.decision_function(input_df))
                prediction_prob = 1 / (1 + np.exp(-raw_score))

            overall_confidence.append(prediction_prob)

            # Risk level mapping
            if prediction_prob < 0.3:
                risk_level = 'low'
            elif prediction_prob < 0.6:
                risk_level = 'moderate'
            elif prediction_prob < 0.8:
                risk_level = 'high'
            else:
                risk_level = 'critical'

            recommendations = generate_recommendations(model.disease_type, risk_level, record)

            predictions_data.append({
                'disease': model.disease_type,
                'probability': round(prediction_prob * 100, 1),
                'risk_level': risk_level,
                'recommendations': recommendations
            })

        except Exception as e:
            print(f"⚠️ Prediction error for {getattr(model, 'disease_type', 'Unknown')}: {e}")
            continue

    # Overall stats
    overall_prob = float(np.mean(overall_confidence)) if overall_confidence else 0.0
    if overall_prob < 0.3:
        overall_risk = 'Low'
    elif overall_prob < 0.6:
        overall_risk = 'Moderate'
    elif overall_prob < 0.8:
        overall_risk = 'High'
    else:
        overall_risk = 'Critical'

    risk_distribution = {
        'Low': round((1 - overall_prob) * 100, 1),
        'Moderate': round(overall_prob * 50, 1),
        'High': round(overall_prob * 30, 1),
    }

    # --- Prepare report session ---
    request.session['health_predictions'] = predictions_data
    request.session['overall_risk'] = overall_risk
    request.session['overall_prob'] = round(overall_prob * 100, 1)
    user_name = request.user.get_full_name() or request.user.username

    request.session['health_prediction'] = {
        'user_name': user_name,
        'input_data': {
            'age': record.age,
            'sex': record.sex,
            'bmi': record.bmi,
            'systolic_bp': record.systolic_bp,
            'diastolic_bp': record.diastolic_bp,
            'heart_rate': record.heart_rate,
        },
        'recommendations': predictions_data[0]['recommendations'] if predictions_data else [],
    }

    # --- Generate PDF report ---
    pdf_path = generate_health_report(user_name, record.__dict__, predictions_data[0] if predictions_data else {})

    # --- Prepare email data ---
    metrics = {
        "BMI": {"value": record.bmi, "status": "Normal"},
        "Blood Pressure": {"value": f"{record.systolic_bp}/{record.diastolic_bp} mmHg", "status": "Normal"},
        "Heart Rate": {"value": f"{record.heart_rate} bpm", "status": "Normal"}
    }
    prob_dist = {
        "Low": min(100, int(overall_prob * 100)),
        "Moderate": max(0, 100 - int(overall_prob * 100)),
        "High": 0
    }

    # --- Send email immediately ---
    send_health_report_email(
        to_email=request.user.email,
        user_name=user_name,
        health_data=record.__dict__,
        prediction_pdf_path=pdf_path,
        risk_level=overall_risk,
        confidence=int(overall_prob * 100),
        metrics=metrics,
        prob_dist=prob_dist,
        recommendations=predictions_data[0]['recommendations'] if predictions_data else []
    )

    messages.success(request, "✅ Health report generated and sent to your email!")

    # Render result page
    context = {
        'record': record,
        'predictions': predictions_data,
        'overall_prob': round(overall_prob * 100, 1),
        'overall_risk': overall_risk,
        'risk_distribution': risk_distribution,
        'recommendations': predictions_data[0]['recommendations'] if predictions_data else [],
        'user_email': request.user.email,
        'confidence_level': round(overall_prob * 100, 1)
    }
    return render(request, 'core/prediction_results.html', context)


def generate_recommendations(disease_type, risk_level, record):
    """Generate personalized health recommendations based on disease and risk level."""
    recommendations = []
    
    base_recommendations = {
        'diabetes': [
            'Monitor blood glucose levels regularly',
            'Maintain a balanced diet low in refined sugars',
            'Exercise for at least 150 minutes per week',
            'Maintain healthy weight (BMI < 25)',
            'Schedule regular check-ups with your doctor'
        ],
        'hypertension': [
            'Reduce sodium intake to less than 2,300mg per day',
            'Exercise regularly (150 min/week)',
            'Maintain healthy weight',
            'Limit alcohol consumption',
            'Manage stress through meditation or yoga'
        ],
        'heart_disease': [
            'Reduce saturated fat intake',
            'Increase physical activity gradually',
            'Quit smoking if applicable',
            'Monitor cholesterol levels',
            'Take prescribed medications as directed'
        ],
        'ckd': [
            'Monitor kidney function regularly',
            'Control blood pressure',
            'Reduce protein intake as advised',
            'Limit sodium and potassium',
            'Stay hydrated appropriately'
        ],
        'copd': [
            'Avoid air pollutants and smoke',
            'Use prescribed inhalers correctly',
            'Exercise as tolerated',
            'Get flu and pneumonia vaccines',
            'Maintain healthy weight'
        ],
        'asthma': [
            'Identify and avoid triggers',
            'Use rescue inhaler as needed',
            'Take controller medication daily',
            'Monitor peak flow regularly',
            'Have an asthma action plan'
        ]
    }
    
    recommendations = base_recommendations.get(disease_type, [])
    
    if risk_level == 'critical':
        recommendations.insert(0, 'URGENT: Schedule an appointment with your doctor immediately')
    elif risk_level == 'high':
        recommendations.insert(0, 'Schedule an appointment with your doctor within the next week')
    
    return recommendations


@login_required
def prediction_detail(request, prediction_id):
    pred = get_object_or_404(Prediction, id=prediction_id)

    return render(request, "core/prediction_detail.html", {
        "prediction": pred
    })

@login_required
def delete_dataset(request, dataset_id):
    profile = request.user.profile
    if profile.role != 'admin':
        messages.error(request, 'Unauthorized access.')
        return redirect('dashboard')

    dataset = get_object_or_404(UploadedDataset, id=dataset_id, owner=request.user)
    dataset.delete()
    messages.success(request, 'Dataset deleted successfully.')
    return redirect('dashboard')

# ==============================
#   Utility: JSON-safe cleaner
# ==============================
def safe_json(obj):
    """Recursively convert numpy data types into Python-native JSON-safe types."""
    if isinstance(obj, (np.generic,)):
        return obj.item()
    elif isinstance(obj, (np.ndarray,)):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {str(k): safe_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [safe_json(v) for v in obj]
    else:
        return obj


# ==============================
#      ADMIN: MODEL TRAINING
# ==============================
@login_required
def train_model(request, dataset_id):
    dataset = get_object_or_404(UploadedDataset, id=dataset_id, owner=request.user)

    # === Load CSV safely ===
    try:
        df = pd.read_csv(dataset.file.path)
    except Exception as e:
        messages.error(request, f"Failed to load dataset: {e}")
        return redirect('dashboard')

    # === Ensure target column exists ===
    target_column = 'disease_within_1yr'
    if target_column not in df.columns:
        messages.error(request, f"Target column '{target_column}' not found in dataset.")
        return redirect('dashboard')

    # === Define features safely ===
    non_predictive = ['patient_id', 'last_visit_date', target_column]
    feature_columns = [c for c in df.columns if c not in non_predictive]
    X = df[feature_columns]
    y = df[target_column]

    # Drop columns that are fully NaN (to avoid imputer errors)
    empty_cols = [c for c in X.columns if X[c].isna().all()]
    if empty_cols:
        messages.warning(request, f"⚠️ Dropping empty columns: {', '.join(empty_cols)}")
        X = X.drop(columns=empty_cols)

    # Detect numeric and categorical features
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object']).columns.tolist()

    # Fill missing categorical values with 'Unknown'
    for col in categorical_features:
        X[col] = X[col].fillna('Unknown')

    # Fill missing numeric values with median
    for col in numeric_features:
        if X[col].isna().any():
            X[col] = X[col].fillna(X[col].median())

    # === Handle POST request ===
    if request.method == 'POST':
        form = SafeTrainModelForm(request.POST)
        if form.is_valid():
            algorithm = form.cleaned_data['algorithm']
            test_size = form.cleaned_data['test_size']

            try:
                # === Preprocessing pipeline ===
                preprocessor = ColumnTransformer([
                    ('num', Pipeline([
                        ('imputer', SimpleImputer(strategy='median')),
                        ('scaler', StandardScaler())
                    ]), numeric_features),
                    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
                ])

                # === Model selection ===
                model_dict = {
                    'logreg': LogisticRegression(max_iter=1000),
                    'rf': RandomForestClassifier(n_estimators=200, max_depth=10, class_weight='balanced', random_state=42),
                    'dt': DecisionTreeClassifier(max_depth=10, class_weight='balanced', random_state=42),
                    'knn': KNeighborsClassifier(n_neighbors=7),
                    'svm': SVC(kernel='rbf', probability=True, random_state=42),
                    'xgb': XGBClassifier(
                        n_estimators=200, max_depth=6, learning_rate=0.1,
                        random_state=42, eval_metric='logloss', use_label_encoder=False
                    ),
                }

                model = model_dict.get(algorithm)
                if model is None:
                    messages.error(request, f"Algorithm '{algorithm}' not supported.")
                    return redirect('train_model', dataset_id=dataset.id)

                pipeline = Pipeline([
                    ('preprocessor', preprocessor),
                    ('model', model)
                ])

                # === Train/test split ===
                stratify = y if len(np.unique(y)) > 1 else None
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=test_size, random_state=42, stratify=stratify
                )

                # === Train model ===
                pipeline.fit(X_train, y_train)

                # === Evaluate ===
                y_pred = pipeline.predict(X_test)
                metrics = {
                    'accuracy': round(float(accuracy_score(y_test, y_pred)), 3),
                    'precision': round(float(precision_score(y_test, y_pred, average='weighted', zero_division=0)), 3),
                    'recall': round(float(recall_score(y_test, y_pred, average='weighted', zero_division=0)), 3),
                    'f1': round(float(f1_score(y_test, y_pred, average='weighted', zero_division=0)), 3),
                }

                # === AUC (if applicable) ===
                if len(np.unique(y_test)) == 2 and hasattr(pipeline.named_steps['model'], 'predict_proba'):
                    y_proba = pipeline.predict_proba(X_test)[:, 1]
                    metrics['auc'] = round(float(roc_auc_score(y_test, y_proba)), 3)
                else:
                    metrics['auc'] = None

                # === Confusion Matrix ===
                cm_array = safe_json(confusion_matrix(y_test, y_pred).tolist())

                # === Feature Importance ===
                feature_importance = {}
                final_model = pipeline.named_steps['model']

                try:
                    feature_names = pipeline.named_steps['preprocessor'].get_feature_names_out(feature_columns)
                except Exception:
                    feature_names = feature_columns

                if hasattr(final_model, 'feature_importances_'):
                    importances = safe_json(final_model.feature_importances_)
                    feature_importance = dict(zip(feature_names, importances))
                elif hasattr(final_model, 'coef_'):
                    importances = safe_json(np.abs(final_model.coef_).flatten())
                    feature_importance = dict(zip(feature_names, importances))

                # === Save trained model ===
                from django.conf import settings
                model_dir = os.path.join(settings.MEDIA_ROOT, "models")
                os.makedirs(model_dir, exist_ok=True)

                filename = f"{algorithm}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pkl"
                model_path = os.path.join(model_dir, filename)

                joblib.dump({
                    'model': pipeline,
                    'feature_columns': feature_columns
                }, model_path)

                # === Save record to DB ===
                trained_model = TrainedModel.objects.create(
                    owner=request.user,
                    dataset=dataset,
                    name=dict(form.fields['algorithm'].choices)[algorithm],
                    algorithm=algorithm,
                    target_column=target_column,
                    metrics=safe_json(metrics),
                    confusion_matrix=safe_json(cm_array),
                    training_params=safe_json({'test_size': test_size, 'features': feature_columns}),
                    model_file=f"models/{filename}",
                    feature_importance=safe_json(feature_importance),
                )

                messages.success(request, f"✅ Model trained successfully! Accuracy: {metrics['accuracy']*100}%")
                return redirect('model_details', model_id=trained_model.id)

            except Exception as e:
                messages.error(request, f"⚠️ Training failed: {e}")
                return redirect('dashboard')

    else:
        form = SafeTrainModelForm()

    return render(request, 'core/train_model.html', {'form': form, 'dataset': dataset})


# ==============================
#       MODEL DETAILS VIEW
# ==============================
@login_required
def model_details(request, model_id):
    model = get_object_or_404(TrainedModel, id=model_id)

    metrics = model.metrics or {}
    metrics_safe = {
        'accuracy': metrics.get('accuracy', 0),
        'precision': metrics.get('precision', 0),
        'recall': metrics.get('recall', 0),
        'f1_score': metrics.get('f1', 0),
        'auc_score': metrics.get('auc', 0),
    }

    cm = model.confusion_matrix or [[0, 0], [0, 0]]
    confusion_dict = {
        'true_negatives': cm[0][0],
        'false_positives': cm[0][1],
        'false_negatives': cm[1][0],
        'true_positives': cm[1][1],
    }

    feature_importance = getattr(model, 'feature_importance', {}) or {}

    return render(request, 'core/model_details.html', {
        'model': model,
        'metrics': metrics_safe,
        'confusion_matrix': confusion_dict,
        'feature_importance': feature_importance,
    })

@login_required
def model_comparison(request):
    profile = request.user.profile
    if profile.role != 'admin':
        messages.error(request, 'Unauthorized access.')
        return redirect('dashboard')

    models = TrainedModel.objects.filter(owner=request.user)
    return render(request, 'core/model_comparison.html', {'models': models})

@login_required
def delete_model(request, model_id):
    profile = request.user.profile
    if profile.role != 'admin':
        messages.error(request, 'Unauthorized access.')
        return redirect('dashboard')

    model = get_object_or_404(TrainedModel, id=model_id, owner=request.user)
    model.delete()
    messages.success(request, 'Model deleted successfully.')
    return redirect('dashboard')


# ==============================
#       REPORT GENERATION
# ==============================

@login_required
def generate_report(request, record_id):
    """Generate a comprehensive health report."""
    record = get_object_or_404(PatientHealthRecord, id=record_id)
    predictions = Prediction.objects.filter(health_record=record)
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    p.setFont("Helvetica-Bold", 20)
    p.drawString(50, height - 50, "AIMed Prognosis - Health Report")
    
    p.setFont("Helvetica", 10)
    p.drawString(50, height - 70, f"Patient: {request.user.get_full_name() or request.user.username}")
    p.drawString(50, height - 85, f"Date: {datetime.datetime.now().strftime('%B %d, %Y')}")
    
    # Vital Signs
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 120, "Vital Signs")
    
    p.setFont("Helvetica", 10)
    y = height - 140
    vitals = [
        f"Age: {record.age} years",
        f"BMI: {record.bmi}",
        f"Blood Pressure: {record.systolic_bp}/{record.diastolic_bp} mmHg",
        f"Heart Rate: {record.heart_rate} bpm",
        f"Temperature: {record.temperature_c}°C"
    ]
    for vital in vitals:
        p.drawString(70, y, vital)
        y -= 15
    
    # Predictions
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y - 20, "Disease Risk Predictions")
    
    p.setFont("Helvetica", 10)
    y -= 40
    for pred in predictions:
        p.drawString(70, y, f"{pred.disease_type.upper()}: {pred.prediction_probability*100:.1f}% ({pred.risk_level})")
        y -= 15
    
    # Recommendations
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y - 20, "Recommendations")
    
    p.setFont("Helvetica", 10)
    y -= 40
    for pred in predictions:
        if pred.recommendations:
            for rec in pred.recommendations[:3]:
                p.drawString(70, y, f"• {rec}")
                y -= 12
    
    p.showPage()
    p.save()
    buffer.seek(0)
    
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="health_report_{record_id}.pdf"'
    return response

# ==============================
#       DOWNLOAD OR EMAIL REPORT
# ==============================
from django.http import FileResponse
from django.contrib import messages
from django.shortcuts import redirect
from .utils import generate_health_report, send_health_report_email  # Make sure you import your helpers
from django.template.loader import render_to_string

@login_required
def download_or_email_report(request, action='download'):
    """
    Generate PDF health report and either:
    - Download it
    - Or email it to the user as a fully styled HTML email with PDF attachment
    """
    prediction_data = request.session.get('health_prediction')
    if not prediction_data:
        messages.error(request, "No prediction data available to generate report.")
        return redirect('dashboard')

    user_name = prediction_data.get('user_name', request.user.username)
    health_data = prediction_data.get('input_data', {})
    recommendations = prediction_data.get('recommendations', [])

    # Optional: get risk level & probability for email display
    overall_risk = request.session.get('overall_risk', 'Low')
    overall_prob = request.session.get('overall_prob', 0)

    # Generate PDF report
    pdf_path = generate_health_report(user_name, health_data, prediction_data)

    if action == 'email':
        # Optional: metrics & risk distribution for HTML email
        metrics = {
            "BMI": {"value": health_data.get("bmi", "N/A"), "status": "Normal"},
            "Blood Pressure": {"value": f"{health_data.get('systolic_bp','')}/{health_data.get('diastolic_bp','')} mmHg", "status": "Normal"},
            "Heart Rate": {"value": f"{health_data.get('heart_rate','')} bpm", "status": "Normal"}
        }
        prob_dist = {
            "Low": min(100, int(overall_prob)),
            "Moderate": max(0, 100 - int(overall_prob)),
            "High": 0
        }

        # Send email
        send_health_report_email(
            to_email=request.user.email,
            user_name=user_name,
            health_data=health_data,
            prediction_pdf_path=pdf_path,
            risk_level=overall_risk,
            confidence=int(overall_prob),
            metrics=metrics,
            prob_dist=prob_dist,
            recommendations=recommendations
        )
        messages.success(request, "✅ Health report sent to your email successfully!")
        return redirect('dashboard')

    # Default: download PDF
    return FileResponse(open(pdf_path, 'rb'), as_attachment=True, filename=os.path.basename(pdf_path))


from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
import os

def send_health_report_email(to_email, user_name, health_data, prediction_pdf_path, risk_level="Low", confidence=70, metrics=None, prob_dist=None, recommendations=None):
    """
    Send a rich HTML health report email with a PDF attachment.
    """
    # Fallback values
    metrics = metrics or {}
    prob_dist = prob_dist or {"Low": 75, "Moderate": 20, "High": 5}
    recommendations = recommendations or []

    # Render HTML template as string
    html_content = render_to_string('core/health_report.html', {
        "user_name": user_name,
        "health_data": health_data,
        "risk_level": risk_level,
        "confidence": confidence,
        "metrics": metrics,
        "prob_dist": prob_dist,
        "recommendations": recommendations,
    })

    subject = "Your AIMed Prognosis Health Report"
    email = EmailMessage(
        subject=subject,
        body=html_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )

    email.content_subtype = "html"  # Important: render as HTML
    email.attach_file(prediction_pdf_path)
    email.send(fail_silently=False)


import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_health_report(user_name, health_data, prediction):
    """Generate and save a health report as a PDF file."""
    reports_dir = os.path.join("media", "reports")
    os.makedirs(reports_dir, exist_ok=True)

    filename = f"health_report_{user_name}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    pdf_path = os.path.join(reports_dir, filename)

    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 50, "AIMed Prognosis - Health Report")

    c.setFont("Helvetica", 10)
    c.drawString(50, height - 70, f"Patient: {user_name}")
    c.drawString(50, height - 85, f"Generated On: {datetime.datetime.now().strftime('%B %d, %Y, %I:%M %p')}")

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, height - 120, "Health Details")

    y = height - 140
    for key, val in health_data.items():
        c.drawString(70, y, f"{key.capitalize()}: {val}")
        y -= 15

    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y - 20, "Recommendations")

    c.setFont("Helvetica", 10)
    y -= 40
    for rec in prediction.get("recommendations", []):
        c.drawString(70, y, f"• {rec}")
        y -= 12

    c.showPage()
    c.save()
    return pdf_path

