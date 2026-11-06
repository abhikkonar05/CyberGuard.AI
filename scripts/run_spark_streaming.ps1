# PowerShell script to run PySpark Structured Streaming Consumer
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CyberGuard AI: PySpark Structured Streaming Consumer     " -ForegroundColor Cyan
Write-Host "  Topic: network-traffic | Micro-Batch Engine              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\spark"

$PythonExe = (Get-Command python).Source
$env:PYSPARK_PYTHON = $PythonExe
$env:PYSPARK_DRIVER_PYTHON = $PythonExe

python streaming/spark_streaming_consumer.py

