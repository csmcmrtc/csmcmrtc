@echo off
echo ============================================================
echo AI Travel Planning Platform - React Version
echo ============================================================
echo.

REM Check if backend venv exists
if not exist "venv\" (
    echo Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Backend Server" cmd /k "venv\Scripts\activate && python -m backend.main"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend-react && npm run dev"

echo.
echo Application started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo.
pause
