# Start the Vedic Astro Backend Server
# Run this script from the backend directory: .\start.ps1

$env:PYTHONPATH = "$PSScriptRoot"
Write-Host "Starting Vedic Astro Backend Server..." -ForegroundColor Green
Write-Host "PYTHONPATH set to: $PSScriptRoot" -ForegroundColor Yellow
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
