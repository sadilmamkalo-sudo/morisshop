@echo off
title MORISSESHOP - Online

echo ========================================
echo    MORISSESHOP - Online Launcher
echo ========================================
echo.
echo Step 1: Starting the server...
cd /d "%~dp0server"
set NODE_ENV=production
set JWT_SECRET=test123456
set WHATSAPP_NUMBER=+212728755639
set ADMIN_EMAIL=admin@morisshop.com
set ADMIN_PASSWORD=Admin123456

start "MORISSESHOP Server" cmd /c "node server.js && pause"
echo Server started on http://localhost:5000
echo.
timeout /t 5 /nobreak >nul

echo Step 2: Checking cloudflared...
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo cloudflared not found. Downloading...
    echo.
    echo Please download cloudflared from:
    echo https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
    echo.
    echo Then run:
    echo   cloudflared tunnel --url http://localhost:5000
    echo.
    pause
) else (
    echo cloudflared found! Starting tunnel...
    start "Cloudflare Tunnel" cmd /c "cloudflared tunnel --url http://localhost:5000 && pause"
    echo.
    echo Tunnel started! Check the new window for your URL.
    echo Share it with your customers!
)

echo.
echo ========================================
echo    Site is running at:
echo    http://localhost:5000
echo ========================================
pause
