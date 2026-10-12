param([switch]$Acceptance, [switch]$SportsPortal, [switch]$CheckOnly)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExecutable = if ($nodeCommand) { $nodeCommand.Source } else {
  Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $nodeExecutable)) {
  throw 'Node.js is unavailable. Install Node.js 24 or configure PATH.'
}
if ($SportsPortal) {
  if (-not (Test-Path -LiteralPath 'integrations/sports-teacher/node_modules/vinext/dist/cli.js')) {
    throw 'Install the sports portal dependencies in integrations/sports-teacher first.'
  }
  $entry = 'scripts/sports-teacher.mjs'
} else {
  if (-not (Test-Path -LiteralPath 'node_modules/vite/package.json')) {
    throw 'Install project dependencies before starting the backend.'
  }
  if ($Acceptance) {
    $acceptanceDatabase = Join-Path $projectRoot 'data/browser-acceptance.sqlite'
    if (-not (Test-Path -LiteralPath $acceptanceDatabase)) {
      throw 'Acceptance database is missing. Initialize test accounts explicitly; this script does not reset or seed data.'
    }
    $env:BNBU_DATABASE = $acceptanceDatabase
    $env:BNBU_LOCAL_OUTBOX = '1'
    $env:BNBU_SCHOOL_EMAIL_DOMAINS = 'example.test'
  }
  $entry = 'scripts/local.mjs'
}
if ($CheckOnly) {
  Write-Output "Ready: $entry"
  exit 0
}
& $nodeExecutable $entry
exit $LASTEXITCODE
