$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendCommand = "Set-Location '$root'; python app.py"
$frontendCommand = "Set-Location '$root/frontend'; npm run dev"

Write-Host 'Starting backend on port 5000...'
Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCommand

Write-Host 'Starting frontend on port 5173...'
Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCommand
