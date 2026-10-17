from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# =========================
# User Profile & Signals
# =========================
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    specialization = models.CharField(max_length=255, blank=True, null=True)
    license_number = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


# =========================
# Patient Profile
# =========================
class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True)
    medical_history = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"


# =========================
# Uploaded Dataset
# =========================
class UploadedDataset(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='datasets/')
    rows_count = models.IntegerField(default=0)
    columns_info = models.JSONField(default=dict)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.owner.username}"

    class Meta:
        ordering = ['-uploaded_at']


# =========================
# Disease Model
# =========================
class DiseaseModel(models.Model):
    DISEASE_CHOICES = [
        ('diabetes', 'Diabetes'),
        ('hypertension', 'Hypertension'),
        ('heart_disease', 'Heart Disease'),
        ('ckd', 'Chronic Kidney Disease'),
        ('copd', 'COPD'),
        ('asthma', 'Asthma'),
    ]

    ALGORITHM_CHOICES = [
        ('logreg', 'Logistic Regression'),
        ('rf', 'Random Forest'),
        ('xgb', 'XGBoost'),
        ('svm', 'Support Vector Machine'),
        ('nn', 'Neural Network'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='disease_models')
    dataset = models.ForeignKey(UploadedDataset, on_delete=models.CASCADE, null=True, blank=True)
    disease_type = models.CharField(max_length=50, choices=DISEASE_CHOICES)
    algorithm = models.CharField(max_length=50, choices=ALGORITHM_CHOICES)
    model_file = models.FileField(upload_to='models/')
    accuracy = models.FloatField(default=0.0)
    precision = models.FloatField(default=0.0)
    recall = models.FloatField(default=0.0)
    f1_score = models.FloatField(default=0.0)
    auc_score = models.FloatField(default=0.0)
    confusion_matrix = models.JSONField(default=dict)
    feature_importance = models.JSONField(default=dict)
    training_params = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    feature_importance = models.JSONField(null=True, blank=True)


    def __str__(self):
        return f"{self.disease_type} - {self.algorithm}"

    class Meta:
        ordering = ['-created_at']


# =========================
# Trained Model
# =========================
class TrainedModel(models.Model):
    DISEASE_CHOICES = [
        ('diabetes', 'Diabetes'),
        ('hypertension', 'Hypertension'),
        ('heart_disease', 'Heart Disease'),
        ('ckd', 'Chronic Kidney Disease'),
        ('copd', 'COPD'),
        ('asthma', 'Asthma'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trained_models')
    dataset = models.ForeignKey(UploadedDataset, on_delete=models.CASCADE, related_name='trained_models')
    name = models.CharField(max_length=255, default="Untitled Model")
    algorithm = models.CharField(max_length=50, default="logreg")

    # 🆕 Added disease type field
    disease_type = models.CharField(
        max_length=50,
        choices=DISEASE_CHOICES,
        default='diabetes',
        help_text="Select which disease this model predicts"
    )

    target_column = models.CharField(max_length=100, default="target")
    metrics = models.JSONField(default=dict)
    confusion_matrix = models.JSONField(default=list)
    model_file = models.FileField(upload_to="models/", blank=True, null=True)
    training_params = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    feature_importance = models.JSONField(default=dict, blank=True, null=True)

    def __str__(self):
        return f"{self.disease_type} - {self.algorithm} ({self.dataset.name})"

    class Meta:
        ordering = ['-created_at']


# =========================
# Patient Health Record
# =========================
class PatientHealthRecord(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='health_records')
    doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='patient_records')
    
    # Vital Signs
    age = models.IntegerField()
    sex = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')])
    bmi = models.FloatField()
    systolic_bp = models.IntegerField()
    diastolic_bp = models.IntegerField()
    heart_rate = models.IntegerField()
    respiratory_rate = models.IntegerField()
    temperature_c = models.FloatField()
    
    # Lab Values
    cholesterol_total_mg_dL = models.FloatField()
    hdl_mg_dL = models.FloatField()
    ldl_mg_dL = models.FloatField()
    triglycerides_mg_dL = models.FloatField()
    glucose_fasting_mg_dL = models.FloatField()
    hba1c_percent = models.FloatField()
    creatinine_mg_dL = models.FloatField()
    egfr_mL_min_1_73m2 = models.FloatField()
    
    # Lifestyle
    smoking_status = models.CharField(max_length=50, choices=[('never', 'Never'), ('former', 'Former'), ('current', 'Current')])
    alcohol_units_per_week = models.FloatField()
    physical_activity_level = models.CharField(max_length=50, choices=[('sedentary', 'Sedentary'), ('light', 'Light'), ('moderate', 'Moderate'), ('vigorous', 'Vigorous')])
    
    # Medical History
    family_history_cvd = models.BooleanField(default=False)
    comorbidities_count = models.IntegerField(default=0)
    comorbidities = models.TextField(blank=True)
    medications_count = models.IntegerField(default=0)
    recent_hospitalizations = models.IntegerField(default=0)
    
    # Wearable Data
    wearable_hr_mean_7d = models.FloatField(null=True, blank=True)
    wearable_steps_avg_7d = models.FloatField(null=True, blank=True)
    
    # Risk Score
    risk_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Health Record - {self.patient.username} ({self.created_at.date()})"

    class Meta:
        ordering = ['-created_at']


# =========================
# Prediction
# =========================
class Prediction(models.Model):
    RISK_LEVELS = [
        ('low', 'Low Risk'),
        ('moderate', 'Moderate Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical Risk'),
    ]

    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    health_record = models.ForeignKey(PatientHealthRecord, on_delete=models.CASCADE, related_name='predictions')
    model = models.ForeignKey(DiseaseModel, on_delete=models.SET_NULL, null=True)
    disease_type = models.CharField(max_length=50)
    
    prediction_probability = models.FloatField()
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    predicted_at = models.DateTimeField(auto_now_add=True)
    
    # Explanation
    top_risk_factors = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.disease_type} Prediction - {self.patient.username}"

    class Meta:
        ordering = ['-created_at']


# =========================
# Report
# =========================
class Report(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    health_record = models.ForeignKey(PatientHealthRecord, on_delete=models.CASCADE)
    predictions = models.ManyToManyField(Prediction)
    
    report_file = models.FileField(upload_to='reports/', null=True, blank=True)
    summary = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Report - {self.patient.username} ({self.created_at.date()})"

    class Meta:
        ordering = ['-created_at']
