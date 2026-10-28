@echo off
title GrantMatch - Scholarship & Funding Platform Launcher
echo =====================================================================
echo           Starting GrantMatch Full-Stack Platform...
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/4] Launching Node.js Express Backend on port 5000...
start "GrantMatch Backend Server" cmd /k "cd backend && node server.js"

echo [2/4] Launching Python FastAPI AI Service on port 8000...
start "GrantMatch AI Service" cmd /k "cd ai-service && python main.py"

echo [3/4] Launching Vite React Frontend on port 5173...
start "GrantMatch Frontend Dev" cmd /k "cd frontend && npm.cmd run dev"

echo [4/4] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening GrantMatch in default browser: http://localhost:5173
start http://localhost:5173

echo.
echo =====================================================================
echo  GrantMatch is now RUNNING!
echo  - Frontend:   http://localhost:5173
echo  - Backend:    http://localhost:5000/api
echo  - AI Service: http://localhost:8000/health
echo.
echo  Demo Credentials:
echo  - Admin:    admin@grantmatch.org / Admin@123
echo  - Student:  user@grantmatch.org / User@123
echo.
echo  NOTE: If the AI service window shows an error, install dependencies:
echo    cd ai-service
echo    pip install -r requirements.txt
echo    python main.py
echo =====================================================================

