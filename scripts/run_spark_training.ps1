# PowerShell script to run PySpark Model Training
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting CyberGuard AI: PySpark MLlib Model Training     " -ForegroundColor Cyan
Write-Host "  Dataset: CSE-CIC-IDS2018 (Canada Institute for Cyber)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\spark"

$PythonExe = (Get-Command python).Source
Write-Host "Using Python Runtime: $PythonExe" -ForegroundColor Yellow

$env:PYSPARK_PYTHON = $PythonExe
$env:PYSPARK_DRIVER_PYTHON = $PythonExe

Write-Host "Running Spark MLlib training workflow..." -ForegroundColor Green
python training/train_mllib_model.py

