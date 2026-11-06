# PowerShell script to run Kafka Traffic Producer
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CyberGuard AI: Starting Simulated Traffic Producer       " -ForegroundColor Cyan
Write-Host "  Topic: network-traffic                                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\spark"

$PythonExe = (Get-Command python).Source
$env:PYSPARK_PYTHON = $PythonExe
$env:PYSPARK_DRIVER_PYTHON = $PythonExe

python producer/traffic_producer.py

