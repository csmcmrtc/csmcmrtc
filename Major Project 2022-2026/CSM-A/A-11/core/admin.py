from django.contrib import admin, messages
from django.urls import path
from django.shortcuts import render, redirect
from django import forms

from .models import (
    UserProfile,
    PatientProfile,
    UploadedDataset,
    DiseaseModel,
    PatientHealthRecord,
    Prediction,
    Report,
    TrainedModel
)

# ---------------------------
# Custom form for dataset upload
# ---------------------------
class DatasetUploadForm(forms.Form):
    file = forms.FileField()


# ---------------------------
# UploadedDataset admin
# ---------------------------
@admin.register(UploadedDataset)
class UploadedDatasetAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'rows_count', 'uploaded_at')
    list_filter = ('uploaded_at', 'owner')
    search_fields = ('name',)

    # Custom admin URLs for upload
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload/', self.admin_site.admin_view(self.upload_dataset), name='dataset_upload'),
        ]
        return custom_urls + urls

    def upload_dataset(self, request):
        """Custom view to handle dataset upload"""
        if request.method == 'POST':
            form = DatasetUploadForm(request.POST, request.FILES)
            if form.is_valid():
                file = form.cleaned_data['file']
                UploadedDataset.objects.create(
                    name=file.name,
                    owner=request.user,
                    file=file
                )
                messages.success(request, "Dataset uploaded successfully!")
                return redirect('admin:core_uploadeddataset_changelist')
        else:
            form = DatasetUploadForm()
        return render(request, 'core/upload_dataset.html', {'form': form})


# ---------------------------
# Other model admins
# ---------------------------
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at')
    list_filter = ('role', 'created_at')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    list_filter = ('created_at',)


@admin.register(DiseaseModel)
class DiseaseModelAdmin(admin.ModelAdmin):
    list_display = ('disease_type', 'algorithm', 'owner', 'accuracy', 'created_at')
    list_filter = ('disease_type', 'algorithm', 'created_at')
    search_fields = ('disease_type',)


@admin.register(PatientHealthRecord)
class PatientHealthRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'age', 'bmi', 'created_at')
    list_filter = ('created_at', 'sex')
    search_fields = ('patient__username',)


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('patient', 'disease_type', 'risk_level', 'prediction_probability', 'predicted_at')
    list_filter = ('disease_type', 'risk_level', 'predicted_at')
    search_fields = ('patient__username',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('patient', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('patient__username',)


@admin.register(TrainedModel)
class TrainedModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'algorithm', 'owner', 'dataset', 'created_at')
    list_filter = ('algorithm', 'created_at')
    search_fields = ('name', 'owner__username')
