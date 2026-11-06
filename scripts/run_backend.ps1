# PowerShell script to run Django Backend
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting CyberGuard AI Backend (Django REST Framework)   " -ForegroundColor Cyan
Write-Host "  Architecture: Database-Free (Local JSON/CSV Storage)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\backend"

$env:DEBUG = "True"
$env:PORT = "8000"

Write-Host "Checking Django configuration..." -ForegroundColor Yellow
python manage.py check

if ($LASTEXITCODE -ne 0) {
    Write-Host "Django check failed. Please resolve errors above." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Django development server at http://127.0.0.1:8000..." -ForegroundColor Green
python manage.py runserver 0.0.0.0:8000

