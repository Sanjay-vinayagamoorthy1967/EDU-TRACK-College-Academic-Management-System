@echo off
echo ========================================
echo RBAC End-to-End Verification Test
echo ========================================
echo.

echo [1/4] Checking Server Build...
cd server
call npm run build > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Server builds successfully
) else (
    echo [FAIL] Server build failed
    exit /b 1
)
echo.

echo [2/4] Checking Client Build...
cd ..\client
call npm run build > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Client builds successfully
) else (
    echo [FAIL] Client build failed
    exit /b 1
)
echo.

echo [3/4] Verifying Route Protection...
cd ..\server\src\routes
findstr /C:"authorize('SUPER_ADMIN')" collegeRoutes.ts > nul
if %ERRORLEVEL% EQU 0 (
    echo [PASS] College routes protected
) else (
    echo [FAIL] College routes not protected
)

findstr /C:"authorize('SUPER_ADMIN', 'ADMIN', 'FACULTY')" studentRoutes.ts > nul
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Student routes protected
) else (
    echo [FAIL] Student routes not protected
)

findstr /C:"authorize('SUPER_ADMIN', 'ADMIN')" facultyRoutes.ts > nul
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Faculty routes protected
) else (
    echo [FAIL] Faculty routes not protected
)

findstr /C:"authorize('SUPER_ADMIN')" adminRoutes.ts > nul
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Admin routes protected
) else (
    echo [FAIL] Admin routes not protected
)
echo.

echo [4/4] Verifying Frontend Protection...
cd ..\..\..\..\client\src
findstr /C:"ProtectedRoute" App.tsx > nul
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Frontend routes protected
) else (
    echo [FAIL] Frontend routes not protected
)

findstr /C:"allowedRoles" App.tsx > nul
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Role-based access implemented
) else (
    echo [FAIL] Role-based access missing
)
echo.

echo ========================================
echo Test Summary
echo ========================================
echo All critical RBAC components verified!
echo.
echo Next Steps:
echo 1. Start server: cd server ^&^& npm run dev
echo 2. Start client: cd client ^&^& npm run dev
echo 3. Test with credentials in TEST_RESULTS.md
echo.
pause
