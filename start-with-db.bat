@echo off
echo ========================================
echo STARTING EDU-TRACK WITH DATABASE
echo ========================================
echo.

cd server

echo [1/3] Checking database...
call npx prisma migrate deploy 2>nul
if %errorlevel% neq 0 (
    echo Database needs setup, running migrations...
    call npx prisma migrate dev --name init
)

echo.
echo [2/3] Seeding database...
call npx prisma db seed

echo.
echo [3/3] Starting server...
start cmd /k "npm run dev"

cd ..
timeout /t 3 >nul

echo.
echo ========================================
echo SERVER STARTED!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Login Credentials:
echo Super Admin: superadmin@edutrack.com / admin123
echo Admin: admin.engineering@edutrack.com / admin123
echo.
echo All colleges from database will now show in dropdowns!
echo.
pause
