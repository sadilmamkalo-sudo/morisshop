@echo off
title MORISSESHOP
echo ========================================
echo    MORISSESHOP - Launcher
echo ========================================
echo.

echo [1/2] Starting Server (port 5000)...
start "MORISSESHOP Server" cmd /c "cd /d %~dp0server && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Client (port 5173)...
start "MORISSESHOP Client" cmd /c "cd /d %~dp0client && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    MORISSESHOP is RUNNING!
echo ========================================
echo.
echo   Site:    http://localhost:5173
echo   Admin:   admin@morisshop.com
echo   Pass:    Admin123456
echo.
echo   Close the windows to stop.
echo.

start http://localhost:5173
pause
