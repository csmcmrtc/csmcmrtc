from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile, PatientProfile, PatientHealthRecord, UploadedDataset

from django import forms

ALGORITHM_CHOICES = [
    ('logreg', 'Logistic Regression'),
    ('rf', 'Random Forest'),
    ('xgb', 'XGBoost'),
    ('svm', 'Support Vector Machine'),
    ('dt', 'Decision Tree'),
    ('knn', 'K-Nearest Neighbors'),
]

class SafeTrainModelForm(forms.Form):
    algorithm = forms.ChoiceField(choices=ALGORITHM_CHOICES, widget=forms.RadioSelect)
    test_size = forms.FloatField(
        min_value=0.1, max_value=0.4, initial=0.2,
        widget=forms.NumberInput(attrs={'step': 0.05})
    )


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        'placeholder': 'you@example.com'
    }))
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        'placeholder': 'Username'
    }))
    password1 = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        'placeholder': '••••••••'
    }))
    password2 = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        'placeholder': '••••••••'
    }))
    role = forms.ChoiceField(choices=UserProfile.ROLE_CHOICES, widget=forms.Select(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
    }))

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2', 'role']


class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        'placeholder': 'Username'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
        'placeholder': '••••••••'
    }))


class PatientProfileForm(forms.ModelForm):
    class Meta:
        model = PatientProfile
        fields = ['date_of_birth', 'gender', 'medical_history', 'current_medications', 'allergies']
        widgets = {
            'date_of_birth': forms.DateInput(attrs={
                'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg',
                'type': 'date'
            }),
            'gender': forms.Select(attrs={
                'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg'
            }),
            'medical_history': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg',
                'rows': 3,
                'placeholder': 'Enter your medical history'
            }),
            'current_medications': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg',
                'rows': 3,
                'placeholder': 'List current medications'
            }),
            'allergies': forms.Textarea(attrs={
                'class': 'w-full px-4 py-3 border border-slate-300 rounded-lg',
                'rows': 3,
                'placeholder': 'List any allergies'
            }),
        }

class PatientHealthRecordForm(forms.ModelForm):
    class Meta:
        model = PatientHealthRecord
        fields = [
            'age', 'sex', 'bmi', 'systolic_bp', 'diastolic_bp', 'heart_rate',
            'respiratory_rate', 'temperature_c', 'cholesterol_total_mg_dL',
            'hdl_mg_dL', 'ldl_mg_dL', 'triglycerides_mg_dL', 'glucose_fasting_mg_dL',
            'hba1c_percent', 'creatinine_mg_dL', 'egfr_mL_min_1_73m2',
            'smoking_status', 'alcohol_units_per_week', 'physical_activity_level',
            'family_history_cvd', 'comorbidities_count', 'comorbidities',
            'medications_count', 'recent_hospitalizations', 'wearable_hr_mean_7d',
            'wearable_steps_avg_7d'
        ]
        widgets = {
            'age': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'sex': forms.Select(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'bmi': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'systolic_bp': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'diastolic_bp': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'heart_rate': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'respiratory_rate': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'temperature_c': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'cholesterol_total_mg_dL': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'hdl_mg_dL': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'ldl_mg_dL': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'triglycerides_mg_dL': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'glucose_fasting_mg_dL': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'hba1c_percent': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'creatinine_mg_dL': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.01'}),
            'egfr_mL_min_1_73m2': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'smoking_status': forms.Select(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'alcohol_units_per_week': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'physical_activity_level': forms.Select(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'family_history_cvd': forms.CheckboxInput(attrs={'class': 'w-4 h-4'}),
            'comorbidities_count': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'comorbidities': forms.Textarea(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'rows': 2}),
            'medications_count': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'recent_hospitalizations': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg'}),
            'wearable_hr_mean_7d': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
            'wearable_steps_avg_7d': forms.NumberInput(attrs={'class': 'w-full px-4 py-3 border rounded-lg', 'step': '0.1'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # ✅ Default values (so form feels pre-filled and friendly)
        self.fields['age'].initial = 25
        self.fields['sex'].initial = 'Male'
        self.fields['bmi'].initial = 22.5
        self.fields['systolic_bp'].initial = 120
        self.fields['diastolic_bp'].initial = 80
        self.fields['heart_rate'].initial = 75
        self.fields['respiratory_rate'].initial = 16
        self.fields['temperature_c'].initial = 36.8
        self.fields['cholesterol_total_mg_dL'].initial = 180
        self.fields['hdl_mg_dL'].initial = 55
        self.fields['ldl_mg_dL'].initial = 100
        self.fields['triglycerides_mg_dL'].initial = 120
        self.fields['glucose_fasting_mg_dL'].initial = 90
        self.fields['hba1c_percent'].initial = 5.4
        self.fields['creatinine_mg_dL'].initial = 0.9
        self.fields['egfr_mL_min_1_73m2'].initial = 100
        self.fields['smoking_status'].initial = 'Non-smoker'
        self.fields['alcohol_units_per_week'].initial = 2
        self.fields['physical_activity_level'].initial = 'Moderate'
        self.fields['family_history_cvd'].initial = False
        self.fields['comorbidities_count'].initial = 0
        self.fields['comorbidities'].initial = "None"
        self.fields['medications_count'].initial = 0
        self.fields['recent_hospitalizations'].initial = 0
        self.fields['wearable_hr_mean_7d'].initial = 72
        self.fields['wearable_steps_avg_7d'].initial = 6000


class DatasetUploadForm(forms.ModelForm):
    class Meta:
        model = UploadedDataset
        fields = ['file']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['file'].required = True
        self.fields['file'].widget.attrs.update({
            'class': 'hidden',
            'accept': '.csv',
            'id': 'file-upload'
        })

    def clean_file(self):
        uploaded_file = self.cleaned_data.get('file')
        if uploaded_file:
            if not uploaded_file.name.endswith('.csv'):
                raise forms.ValidationError("Only CSV files are allowed.")
            if uploaded_file.size > 5 * 1024 * 1024:  # 5 MB limit
                raise forms.ValidationError("File size must be under 5MB.")
        return uploaded_file