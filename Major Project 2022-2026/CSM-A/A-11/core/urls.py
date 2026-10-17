from django.urls import path
from core import views

urlpatterns = [
    # =========================
    # Authentication
    # =========================
    path('', views.home, name='home'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # =========================
    # Dashboard
    # =========================
    path('dashboard/', views.dashboard, name='dashboard'),

    # =========================
    # Patient Section
    # =========================
    path('patient/profile/', views.patient_profile, name='patient_profile'),


    # Health Records
    path('patient/health-record/add/', views.add_health_record, name='add_health_record'),
    path('patient/health-records/', views.health_records, name='health_records'),

    # Predictions & Reports
    path('patient/predict/<int:record_id>/', views.predict_disease, name='predict_disease'),
    path('patient/prediction/<int:prediction_id>/', views.prediction_detail, name='prediction_detail'),

    path('patient/report/<int:record_id>/', views.generate_report, name='generate_report'),

    # Report download/email actions
    path('patient/report/<str:action>/', views.download_or_email_report, name='download_or_email_report'),
    path('report/<str:action>/', views.download_or_email_report, name='download_or_email_report'),

    # =========================
    # Admin / Doctor Section
    # =========================
    path('dataset/upload/', views.upload_dataset, name='upload_dataset'),
    path('dataset/import/', views.import_aimed_dataset, name='import_aimed_dataset'),
    path('dataset/delete/<int:dataset_id>/', views.delete_dataset, name='delete_dataset'),

    # Model Management
    path('model/train/<int:dataset_id>/', views.train_model, name='train_model'),
    path('model/<int:model_id>/', views.model_details, name='model_details'),
    path('model/delete/<int:model_id>/', views.delete_model, name='delete_model'),

    # Model Comparison
    path('comparison/', views.model_comparison, name='model_comparison'),
]
