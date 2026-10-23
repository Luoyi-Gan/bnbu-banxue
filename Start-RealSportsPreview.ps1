param([string]$ConnectionFile = (Join-Path $env:LOCALAPPDATA 'BNBU-Companion\Sports\connection.json'))
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path -LiteralPath $ConnectionFile -PathType Leaf)) { throw 'Real Sports connection file is missing. Configure the protected connection first.' }
$env:BNBU_SPORTS_CONNECTION_FILE = (Resolve-Path -LiteralPath $ConnectionFile).Path
$sportsTunnelPort = Get-NetTCPConnection -LocalPort 4180 -State Listen -ErrorAction SilentlyContinue
if (-not $sportsTunnelPort) {
    $sportsTunnelProcess = Start-Process -FilePath ssh.exe -ArgumentList @('-NT','-L','127.0.0.1:4180:127.0.0.1:4180','-o','BatchMode=yes','-o','ExitOnForwardFailure=yes','-o','ServerAliveInterval=30','-o','ServerAliveCountMax=3','bnbu-hk') -WindowStyle Hidden -PassThru
    $sportsTunnelProcess.Id | Set-Content -LiteralPath (Join-Path (Split-Path $ConnectionFile -Parent) 'tunnel.pid')
    for ($attempt=0; $attempt -lt 30; $attempt++) {
        if (Get-NetTCPConnection -LocalPort 4180 -State Listen -ErrorAction SilentlyContinue) { break }
        if ($sportsTunnelProcess.HasExited) { throw 'Sports SSH tunnel could not be established.' }
        Start-Sleep -Milliseconds 200
    }
    if (-not (Get-NetTCPConnection -LocalPort 4180 -State Listen -ErrorAction SilentlyContinue)) { throw 'Sports SSH tunnel timed out.' }
}
if (-not $env:DEEPSEEK_API_KEY) { $env:DEEPSEEK_API_KEY = [Environment]::GetEnvironmentVariable('DEEPSEEK_API_KEY','User') }
$env:BNBU_STUDY_AI_PROVIDER = 'deepseek'
node artifacts/learning-20261022/preview.mjs
