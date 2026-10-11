@echo off
echo ========================================================
echo   Starting FixNearby - Backend (Flask) & Frontend (Vite)
echo ========================================================

:: Start Backend in a separate window
start "FixNearby Backend - Flask (Port 5000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && python run.py"

:: Start Frontend in a separate window
start "FixNearby Frontend - React Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers started!
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:5173
echo.

