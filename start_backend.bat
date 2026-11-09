@echo off
title DATA VISTA Backend (Flask API)
echo ========================================================
echo   Starting DATA VISTA Backend REST API on Port 5000
echo ========================================================
cd /d "%~dp0backend"
python app.py
pause
