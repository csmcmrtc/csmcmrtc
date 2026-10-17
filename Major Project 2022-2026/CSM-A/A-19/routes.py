from flask import render_template, url_for, flash, redirect, request, Blueprint
import os
import secrets
import numpy as np
from PIL import Image
from flask import render_template, url_for, flash, redirect, request, abort, Blueprint, current_app, jsonify
from app import db, bcrypt
from app.forms import (LoginForm, NewReportForm, RequestResetForm, ResetPasswordForm,
                       PatientRegistrationForm, DoctorRegistrationForm, PatientLoginForm, UpdateAccountForm)
from flask_mail import Message
from app import mail
from app.models import User, Report
from flask_login import login_user, current_user, logout_user, login_required
from app.ml_service import predict_image_and_stage
from chatbot.agent import ChatbotAgent

main = Blueprint('main', __name__)

# Initialize the AI Chatbot agent once
chatbot_agent = ChatbotAgent()

@main.route("/")
@main.route("/home")
def home():
    if current_user.is_authenticated:
        if current_user.role.lower().strip() == 'patient':
            return redirect(url_for('main.patient_dashboard'))
        else:
            return redirect(url_for('main.doctor_dashboard'))
    return redirect(url_for('main.login'))

@main.route("/login")
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    return render_template('login.html', title='Login')

@main.route('/register_patient', methods=['GET', 'POST'])
def register_patient():
    form = PatientRegistrationForm()
    if form.validate_on_submit():
        user = User(
            username=form.username.data,
            email=form.email.data,
            phone_number=form.phone_number.data,
            password=bcrypt.generate_password_hash(form.password.data).decode('utf-8'),
            role='patient',
            patient_id=form.patient_id.data
        )
        db.session.add(user)
        db.session.commit()
        flash('Patient registered successfully!', 'success')
        return redirect(url_for('main.login'))
    return render_template('patient_register.html', form=form)


@main.route("/register/doctor", methods=['GET', 'POST'])
def register_doctor():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = DoctorRegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username=form.username.data, email=form.email.data, phone_number=form.phone_number.data, password=hashed_password, role='doctor')
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash('Your account has been created and you are now logged in!', 'success')
        return redirect(url_for('main.doctor_dashboard'))
    return render_template('doctor_register.html', title='Doctor Registration', form=form)

@main.route("/login/patient", methods=['GET', 'POST'])
def login_patient():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = PatientLoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(patient_id=form.patient_id.data).first()
        if user and user.role.lower().strip() == 'patient' and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.patient_dashboard'))
        else:
            flash('Login Unsuccessful. Please check patient ID and password.', 'danger')
    return render_template('patient_login.html', title='Patient Login', form=form)

@main.route("/login/doctor", methods=['GET', 'POST'])
def login_doctor():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.role.lower().strip() == 'doctor' and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('main.doctor_dashboard'))
        else:
            flash('Login Unsuccessful. Please check email and password.', 'danger')
    return render_template('doctor_login.html', title='Doctor Login', form=form)

@main.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('main.home'))

def save_picture(form_picture):
    """Saves uploaded picture and returns filename and numpy array."""
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(current_app.root_path, 'static/scan_images', picture_fn)
    os.makedirs(os.path.dirname(picture_path), exist_ok=True)
    
    img = Image.open(form_picture)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(picture_path)
    return picture_fn, np.array(img)

@main.route("/patient/dashboard", methods=['GET', 'POST'])
@login_required
def patient_dashboard():
    if current_user.role.lower().strip() != 'patient':
        abort(403)
    
    form = NewReportForm()
    if form.validate_on_submit():
        image_filename, image_array = save_picture(form.scan_image.data)
        status, stage, details = predict_image_and_stage(image_array)
        
        report = Report(image_file=image_filename, cancer_status=status, cancer_stage=stage, 
                        prediction_details=details, author=current_user, 
                        age=form.age.data, symptoms=form.symptoms.data)
        db.session.add(report)
        db.session.commit()
        flash('Your new report has been generated!', 'success')
        return redirect(url_for('main.patient_dashboard'))

    reports = Report.query.filter_by(author=current_user).order_by(Report.date_posted.desc()).all()
    return render_template('patient_dashboard.html', title='My Dashboard', reports=reports, form=form)

@main.route('/account', methods=['GET', 'POST'])
@login_required
def account():
    form = UpdateAccountForm()
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.email = form.email.data
        current_user.phone_number = form.phone_number.data
        db.session.commit()
        flash('Your profile has been updated!', 'success')
        return redirect(url_for('main.account'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.email.data = current_user.email
        form.phone_number.data = current_user.phone_number

    return render_template('account.html', title='My Profile', form=form)

@main.route('/doctor_dashboard')
@login_required
def doctor_dashboard():
    if current_user.role.lower().strip() != 'doctor':
        abort(403)
    patients = User.query.filter_by(role='patient').all()
    return render_template('doctor_dashboard.html', patients=patients)


@main.route("/doctor/patient/<int:patient_id>")
@login_required
def patient_details(patient_id):
    if current_user.role.lower().strip() != 'doctor':
        abort(403)
    patient = User.query.get_or_404(patient_id)
    if patient.role.lower().strip() != 'patient':
        abort(404) # Ensure a doctor isn't looking up another doctor
    
    reports = Report.query.filter_by(author=patient).order_by(Report.date_posted.desc()).all()
    return render_template('patient_details.html', title=f"Reports for {patient.username}", patient=patient, reports=reports)


@main.route("/api/patient/<int:patient_id>/reports")
@login_required
def api_patient_reports(patient_id):
    if current_user.role.lower().strip() != 'doctor':
        abort(403)
    patient = User.query.get_or_404(patient_id)
    if patient.role.lower().strip() != 'patient':
        abort(404)
    reports = Report.query.filter_by(author=patient).order_by(Report.date_posted.desc()).all()
    return render_template('_reports.html', reports=reports)


@main.route("/api/chatbot", methods=['POST'])
@login_required
def api_chatbot():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required.'}), 400

    user_message = data['message']
    ai_response = chatbot_agent.get_response(user_message, history=[]) # History can be enhanced later
    return jsonify({'response': ai_response})

def send_reset_email(user):
    token = user.get_reset_token()
    msg = Message('Password Reset Request',
                  sender='noreply@demo.com',
                  recipients=[user.email])
    msg.body = f'''To reset your password, visit the following link:
{url_for('main.reset_token', token=token, _external=True)}

If you did not make this request then simply ignore this email and no changes will be made.
'''
    mail.send(msg)


@main.route("/reset_password", methods=['GET', 'POST'])
def reset_request():
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    form = RequestResetForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        send_reset_email(user)
        flash('An email has been sent with instructions to reset your password.', 'info')
        return redirect(url_for('main.login_patient'))
    return render_template('reset_request.html', title='Reset Password', form=form)


@main.route("/reset_password/<token>", methods=['GET', 'POST'])
def reset_token(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.home'))
    user = User.verify_reset_token(token)
    if user is None:
        flash('That is an invalid or expired token', 'warning')
        return redirect(url_for('main.reset_request'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user.password = hashed_password
        db.session.commit()
        flash('Your password has been updated! You are now able to log in', 'success')
        return redirect(url_for('main.login_patient'))
    return render_template('reset_token.html', title='Reset Password', form=form)