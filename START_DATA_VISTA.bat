@echo off
title DATA VISTA Intelligence Platform
color 0B
echo ===============================================================================
echo            DATA VISTA - CAREER, INTERNSHIP & PLACEMENT PLATFORM               
echo ===============================================================================
echo.
echo [1/3] Checking environment & ports...

cd /d "%~dp0"

:: Start Backend Flask Server on port 5000 if not already running
netstat -ano | findstr :5000 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Backend server is already running on port 5000.
) else (
    echo [INFO] Starting Backend Flask API on port 5000...
    start "DATA VISTA Backend" /min cmd /c "cd /d %~dp0backend && python app.py"
)

:: Start Frontend Vite Server on port 5173 if not already running
netstat -ano | findstr :5173 | findstr LISTENING >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Frontend server is already running on port 5173.
) else (
    echo [INFO] Starting Frontend Dev Server on port 5173...
    start "DATA VISTA Frontend" /min cmd /c "cd /d %~dp0frontend && npm.cmd run dev"
)

echo.
echo [2/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Opening DATA VISTA in your default browser...
start http://localhost:5173/

echo.
echo ===============================================================================
echo   APPLICATION IS RUNNING!
echo   - Local URL (Dev):       http://localhost:5173/
echo   - Unified Server URL:    http://localhost:5000/
echo.
echo   Demo Login:
echo     Student:  CS2024001 / password123 (or use 1-click quick demo buttons)
echo     Admin:    admin / admin123
echo ===============================================================================
echo.
echo Leave this launcher open or minimize it. Press any key to exit launcher window.
pause >nul
