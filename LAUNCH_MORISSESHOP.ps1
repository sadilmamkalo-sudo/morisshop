Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   MORISSESHOP - Launcher" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Server
Write-Host "[1/2] Starting Server (port 5000)..." -ForegroundColor Cyan
$serverJob = Start-Job -ScriptBlock {
  Set-Location $using:rootDir\server
  npm run dev
}

Start-Sleep -Seconds 3

# Start Client
Write-Host "[2/2] Starting Client (port 5173)..." -ForegroundColor Cyan
$clientJob = Start-Job -ScriptBlock {
  Set-Location $using:rootDir\client
  npm run dev
}

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   MORISSESHOP is RUNNING!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Site:    http://localhost:5173" -ForegroundColor White
Write-Host "  Admin:   admin@morisshop.com" -ForegroundColor White
Write-Host "  Pass:    Admin123456" -ForegroundColor White
Write-Host ""
Write-Host "  Press any key to STOP everything..." -ForegroundColor Red
Write-Host ""

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "Stopping..." -ForegroundColor Red
Stop-Job $serverJob
Stop-Job $clientJob
Remove-Job $serverJob
Remove-Job $clientJob
Write-Host "Stopped." -ForegroundColor Green
