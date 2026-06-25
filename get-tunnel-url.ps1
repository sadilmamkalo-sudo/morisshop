$logFile = "$env:TEMP\cf-tunnel-url.txt"
$proc = Start-Process -FilePath "$args\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:5000 --no-autoupdate" -WindowStyle Hidden -RedirectStandardOutput $logFile -PassThru
Start-Sleep -Seconds 12
$content = Get-Content $logFile
$urlLine = $content | Select-String "https://.*\.trycloudflare\.com" | Select-Object -First 1
if ($urlLine) {
    $url = $urlLine.Matches[0].Value
    Set-Content -Path "$env:TEMP\cf-url.txt" -Value $url
    Write-Host "Tunnel URL: $url"
} else {
    Write-Host "URL not found yet, checking log..."
    $content
}
