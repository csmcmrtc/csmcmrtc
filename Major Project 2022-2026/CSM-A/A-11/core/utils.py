import os
import pdfkit
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.conf import settings

# Ensure 'media/reports' exists
REPORT_DIR = os.path.join(settings.MEDIA_ROOT, 'reports')
os.makedirs(REPORT_DIR, exist_ok=True)


def generate_health_report(user_name, health_data, prediction_data):
    """
    Generate PDF health report from HTML template using pdfkit (Windows-compatible).
    Returns the path to the generated PDF.
    """
    # Render HTML content
    html_content = render_to_string('core/health_report.html', {
        'user_name': user_name,
        'health_data': health_data,
        'prediction_data': prediction_data,
    })

    # Safe filename
    safe_name = user_name.replace(" ", "_")
    pdf_path = os.path.join(REPORT_DIR, f"{safe_name}_health_report.pdf")

    # Generate PDF (requires wkhtmltopdf installed and on PATH)
    pdfkit.from_string(html_content, pdf_path)

    return pdf_path


def send_health_report_email(to_email, user_name, health_data, prediction_pdf_path,
                             risk_level='Low', confidence=0, metrics=None, prob_dist=None, recommendations=None):
    """
    Sends health report email to patient with PDF attachment.
    """
    # Render HTML email (same template as PDF or a dedicated email template)
    html_message = render_to_string('core/health_report_email.html', {
        'user_name': user_name,
        'health_data': health_data,
        'risk_level': risk_level,
        'confidence': confidence,
        'metrics': metrics or {},
        'prob_dist': prob_dist or {},
        'recommendations': recommendations or [],
    })

    subject = f"AIMed Prognosis - Your Health Report"
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )
    email.content_subtype = 'html'  # Send as HTML
    email.attach_file(health_report_path := prediction_pdf_path)  # Attach PDF

    email.send(fail_silently=False)
    return True
