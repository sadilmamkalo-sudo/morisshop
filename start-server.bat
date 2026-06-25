@echo off
title MORISSESHOP Server
cd /d "%~dp0server"
set NODE_ENV=production
set JWT_SECRET=test123456
set WHATSAPP_NUMBER=+212728755639
set ADMIN_EMAIL=admin@morisshop.com
set ADMIN_PASSWORD=Admin123456
echo Starting MORISSESHOP Server...
echo Access at: http://localhost:5000
echo.
node server.js
pause
