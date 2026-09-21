@echo off
echo ========================================
echo    EDU-TRACK PRODUCTION SETUP
echo ========================================
echo.
echo This script will:
echo 1. Reset the database completely
echo 2. Remove all demo data
echo 3. Create only Super Admin account
echo 4. Set up production environment
echo.
echo WARNING: This will DELETE ALL existing data!
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Setup cancelled.
    pause
    exit /b 1
)

echo.
echo Starting production setup...
echo.

cd server

echo 1. Installing server dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo 2. Resetting database...
call npx prisma migrate reset --force
if errorlevel 1 (
    echo ERROR: Failed to reset database
    pause
    exit /b 1
)

echo.
echo 3. Running production seed...
call npx tsx prisma/production-seed.ts
if errorlevel 1 (
    echo ERROR: Failed to run production seed
    pause
    exit /b 1
)

echo.
echo 4. Starting server...
start "EDU-TRACK Server" cmd /k "npm run dev"

cd ..\client

echo.
echo 5. Installing client dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo 6. Starting client...
start "EDU-TRACK Client" cmd /k "npm run dev"

echo.
echo ========================================
echo    PRODUCTION SETUP COMPLETE!
echo ========================================
echo.
echo IMPORTANT CREDENTIALS:
echo Email: superadmin@edutrack.system
echo Password: SuperAdmin@2024!
echo.
echo SECURITY REMINDERS:
echo 1. Change the Super Admin password immediately
echo 2. Set strong JWT_SECRET in server/.env
echo 3. Configure proper database credentials
echo 4. Enable HTTPS in production
echo 5. Set up proper backup procedures
echo.
echo The application will open in your browser shortly.
echo Both server and client are running in separate windows.
echo.
pause