@echo off
title DATA VISTA Frontend
echo Moving into frontend folder...
cd /d "%~dp0frontend"
echo Current directory: %CD%
echo.
echo Installing frontend dependencies...
call npm install
echo.
echo Starting frontend dev server...
call npm run dev
pause
