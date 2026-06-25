$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
$out = "$PSScriptRoot\cloudflared.exe"
Write-Host "Downloading cloudflared from GitHub..." -ForegroundColor Cyan
Write-Host "This may take a few minutes depending on your internet speed." -ForegroundColor Yellow
$ProgressPreference = 'Continue'
try {
    Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
    $size = (Get-Item $out).Length
    Write-Host "Downloaded successfully! Size: $([math]::Round($size/1MB, 1)) MB" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    Write-Host "Try manually: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/" -ForegroundColor Yellow
}
pause
