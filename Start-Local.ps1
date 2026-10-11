param([switch]$Acceptance)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$bnbuNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $bnbuNode) {
  $bnbuNodePath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (-not (Test-Path -LiteralPath $bnbuNodePath)) { throw '请安装 Node.js 24 后重试。' }
} else { $bnbuNodePath = $bnbuNode.Source }
if (-not (Test-Path -LiteralPath 'node_modules/vite/package.json')) { throw '请先在本目录执行 npm ci。' }
if ($Acceptance) {
  & $bnbuNodePath scripts/acceptance.mjs prepare
  if ($LASTEXITCODE -ne 0) { throw '验收数据库初始化失败。' }
  $env:BNBU_DATABASE = Join-Path $PSScriptRoot 'data/browser-acceptance.sqlite'
  $env:BNBU_LOCAL_OUTBOX = '1'
  Write-Host '使用独立验收数据库（非学校真实身份）。账号见 data/browser-acceptance-accounts.json。'
}
& $bnbuNodePath scripts/local.mjs
