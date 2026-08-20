$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$pythonPath = Join-Path $projectRoot ".venv\Scripts\python.exe"
$frontendPath = Join-Path $projectRoot "frontend"

if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "未找到 .venv，请先按 README 安装后端依赖。"
}

$api = Start-Process -FilePath $pythonPath `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--port", "8000" `
    -WorkingDirectory $projectRoot -PassThru -NoNewWindow

try {
    Set-Location $frontendPath
    & npm.cmd run dev
}
finally {
    Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue
}
