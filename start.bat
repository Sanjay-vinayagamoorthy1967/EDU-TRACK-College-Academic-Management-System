@echo off
echo ========================================
echo   Student Success Hub - Startup Script
echo ========================================
echo.

echo [1/4] Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Starting Backend Server (Port 5000)...
cd server
start "Backend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/4] Starting Frontend Server (Port 5173)...
cd ..\client
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Opening Application in Browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
