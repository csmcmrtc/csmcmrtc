@echo off
REM Setup script for AI Travel Planning Platform (Windows)

echo ============================================================
echo AI Travel Planning Platform - Setup Script
echo ============================================================
echo.

REM Check Python installation
python --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo Python found:
python --version
echo.

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv
echo Virtual environment created.
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ============================================================
    echo IMPORTANT: Please edit .env file and add your Gemini API key
    echo ============================================================
    echo.
    echo Get your API key from: https://makersuite.google.com/app/apikey
    echo.
)

echo ============================================================
echo Setup completed successfully!
echo ============================================================
echo.
echo Next steps:
echo 1. Edit .env file and add your GEMINI_API_KEY
echo 2. Run start.bat to launch the application
echo.
pause
