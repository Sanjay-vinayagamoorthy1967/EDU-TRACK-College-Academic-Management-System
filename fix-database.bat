@echo off
echo ========================================
echo FIXING DATABASE AND SEEDING DATA
echo ========================================
echo.

cd server

echo [1/4] Applying database migrations...
call npx prisma migrate deploy
echo.

echo [2/4] Generating Prisma client...
call npx prisma generate
echo.

echo [3/4] Seeding database with demo data...
call npx prisma db seed
echo.

echo [4/4] Restarting server...
cd ..
echo.

echo ========================================
echo DATABASE FIXED!
echo ========================================
echo.
echo Demo Credentials:
echo Super Admin: superadmin@edutrack.com / admin123
echo Admin: admin.engineering@edutrack.com / admin123
echo Faculty: faculty.cs@edutrack.com / admin123
echo Student: rahul.student@edutrack.com / admin123
echo.
echo Now restart your server with: npm run dev
echo.
pause
