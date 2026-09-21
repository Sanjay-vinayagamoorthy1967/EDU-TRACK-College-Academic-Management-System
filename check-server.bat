@echo off
echo Checking server status...
curl -s http://localhost:5000/health
if %errorlevel% equ 0 (
    echo Server is running!
) else (
    echo Server is not responding. Starting server...
    cd server
    npm run dev
)
pause