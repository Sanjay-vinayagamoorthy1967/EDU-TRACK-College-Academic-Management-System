@echo off
echo ========================================
echo   Student Success Hub - Complete Setup
echo ========================================
echo.

echo [1/8] Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/8] Installing server dependencies...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    npm install
) else (
    echo Server dependencies already installed.
)

echo [3/8] Generating Prisma client...
npx prisma generate

echo [4/8] Installing client dependencies...
cd ..\client
if not exist node_modules (
    echo Installing client dependencies...
    npm install
) else (
    echo Client dependencies already installed.
)

echo [5/8] Starting Backend Server (Port 5000)...
cd ..\server
start "Backend Server" cmd /k "npm run dev"
timeout /t 8 /nobreak >nul

echo [6/8] Checking server health...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend server is running!
) else (
    echo ⚠️  Backend server may still be starting...
)

echo [7/8] Starting Frontend Server (Port 5173)...
cd ..\client
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [8/8] Opening Application in Browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo   Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Health:   http://localhost:5000/health
echo.
echo If you see connection errors:
echo 1. Wait a few more seconds for servers to fully start
echo 2. Check if MySQL is running on port 3306
echo 3. Run 'npm run dev' manually in server folder
echo.
echo Press any key to close this window...
pause >nul