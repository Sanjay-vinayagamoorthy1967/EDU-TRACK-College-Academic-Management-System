@echo off
echo ========================================
echo   Fixing Frontend Vite Cache Issue
echo ========================================
echo.

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Clearing Vite cache...
cd client
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite
echo Cache cleared successfully!

echo [3/3] Starting servers...
cd ..\server
start "Backend Server - Port 5000" cmd /k "npx tsx watch src/index.ts"
timeout /t 3 /nobreak >nul

cd ..\client
start "Frontend Server - Port 5173" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
