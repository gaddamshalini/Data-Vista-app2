@echo off
cd /d "%~dp0frontend"
call npm install
echo npm install done
cd /d "%~dp0backend"
start "Flask Backend" python app.py
cd /d "%~dp0frontend"
start "Vite Frontend" npm run dev
timeout /t 5 /nobreak >nul
start http://localhost:5173
