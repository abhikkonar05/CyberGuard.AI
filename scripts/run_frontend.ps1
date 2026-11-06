# PowerShell script to run React Frontend
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting CyberGuard AI Frontend (React + Vite + Tailwind) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

Write-Host "Launching Vite dev server on http://localhost:5173..." -ForegroundColor Green
.\node_modules\.bin\vite.CMD --host

