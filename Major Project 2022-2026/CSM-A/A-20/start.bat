@echo off
REM Start script for AI Travel Planning Platform (Windows)

echo ============================================================
echo AI Travel Planning Platform - Startup Script
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Install dependencies
echo Checking dependencies...
pip install -r requirements.txt --quiet
echo Dependencies installed.
echo.

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and add your API key.
    echo.
    pause
    exit /b 1
)

echo ============================================================
echo Starting Backend Server...
echo ============================================================
echo.

start "Backend Server" cmd /k "venv\Scripts\activate && python -m backend.main"

REM Wait for backend to start
timeout /t 5 /nobreak > nul

echo ============================================================
echo Starting Frontend Application...
echo ============================================================
echo.

start "Frontend App" cmd /k "venv\Scripts\activate && streamlit run frontend/app.py"

echo.
echo ============================================================
echo Application started successfully!
echo.
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:8501
echo ============================================================
echo.
echo Press any key to exit this window...
pause > nul
