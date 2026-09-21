@echo off
title Student Success Hub - RBAC System
color 0A

echo ========================================
echo   Student Success Hub - Starting...
echo ========================================
echo.

echo [Step 1/3] Checking dependencies...
cd server
if not exist "node_modules\" (
    echo Installing server dependencies...
    call npm install
)
cd ..\client
if not exist "node_modules\" (
    echo Installing client dependencies...
    call npm install
)
cd ..
echo [OK] Dependencies ready
echo.

echo [Step 2/3] Starting Backend Server...
cd server
start "Backend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
echo [OK] Server started on http://localhost:5000
echo.

echo [Step 3/3] Starting Frontend Client...
cd ..\client
start "Frontend Client" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul
echo [OK] Client starting on http://localhost:5173
echo.

echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Test Credentials:
echo   Super Admin: superadmin@edutrack.com / admin123
echo   Admin:       admin@democollege.edu / admin123
echo   Faculty:     faculty@democollege.edu / faculty123
echo   Student:     student@democollege.edu / student123
echo.
echo Press any key to stop all servers...
pause > nul

echo.
echo Stopping servers...
taskkill /FI "WindowTitle eq Backend Server*" /T /F > nul 2>&1
taskkill /FI "WindowTitle eq Frontend Client*" /T /F > nul 2>&1
echo Servers stopped.
