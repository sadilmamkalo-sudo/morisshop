@echo off
title MORISSESHOP - Tunnel

echo Starting Cloudflare Tunnel to http://localhost:5000
echo.
echo Share the URL below with your customers!
echo.
cloudflared tunnel --url http://localhost:5000
pause
