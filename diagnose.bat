@echo off
echo ========================================
echo EDU-TRACK DIAGNOSTIC TOOL
echo ========================================
echo.

echo [1/6] Checking Backend Server...
curl -s http://localhost:5000/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on http://localhost:5000
) else (
    echo ❌ Backend is NOT running
    echo    Start it with: cd server ^&^& npm run dev
)

echo.
echo [2/6] Checking Frontend Server...
curl -s http://localhost:5173 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on http://localhost:5173
) else (
    echo ❌ Frontend is NOT running
    echo    Start it with: cd client ^&^& npm run dev
)

echo.
echo [3/6] Testing API Endpoints...
curl -s http://localhost:5000/api/colleges > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API endpoints accessible
) else (
    echo ❌ API endpoints not accessible
)

echo.
echo [4/6] Checking Database Connection...
curl -s http://localhost:5000/health | findstr /C:"Connected" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Database connected
) else (
    echo ❌ Database not connected
    echo    Check MySQL service
)

echo.
echo [5/6] Testing Login Endpoint...
curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test\",\"password\":\"test\"}" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Login endpoint responding
) else (
    echo ❌ Login endpoint not responding
)

echo.
echo [6/6] Checking CORS Configuration...
curl -s -I http://localhost:5000/health | findstr /C:"Access-Control" > nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ CORS configured
) else (
    echo ⚠️  CORS headers not found
)

echo.
echo ========================================
echo DIAGNOSTIC SUMMARY
echo ========================================
echo.
echo If all checks pass:
echo   ✅ System is working correctly
echo   ✅ Try clearing browser cache (Ctrl+Shift+Delete)
echo   ✅ Try hard reload (Ctrl+F5)
echo   ✅ Try logging out and logging in again
echo.
echo If any checks fail:
echo   1. Start the failed service
echo   2. Check error logs in terminal
echo   3. Verify .env configuration
echo.
echo ========================================
echo QUICK FIXES
echo ========================================
echo.
echo Clear Browser Cache:
echo   1. Press Ctrl+Shift+Delete
echo   2. Select "Cached images and files"
echo   3. Click "Clear data"
echo   4. Reload page (Ctrl+F5)
echo.
echo Reset Session:
echo   1. Open browser console (F12)
echo   2. Run: localStorage.clear()
echo   3. Reload page
echo   4. Login again
echo.
echo Restart Services:
echo   Backend:  cd server ^&^& npm run dev
echo   Frontend: cd client ^&^& npm run dev
echo.
pause
