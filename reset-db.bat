@echo off
echo Resetting database and creating Super Admin...
cd server
call npx prisma migrate reset --force --skip-seed
call npx tsx prisma/production-seed.ts
echo.
echo Done! Use these credentials:
echo Email: superadmin@edutrack.system
echo Password: SuperAdmin@2024!
pause