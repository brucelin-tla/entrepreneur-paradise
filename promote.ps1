# promote.ps1 - promote the beta/ build to the LIVE root (GitHub Pages).
# Run from the repo root. Copies beta -> root for game.js / version.json / css / config,
# takes beta's index.html and strips the BETA branding back to the live look, and rebuilds
# the standalone root game.html.
#
# It does NOT commit or push. The /promote command orchestrates the gate (run /playtest first),
# RELEASE_NOTES, a preview verify, the commit, and the owner-confirmed push.
#
# Safe because game.js is DECOUPLED: the Beta-Tester button code lives in BOTH root and beta
# game.js and only renders on the live build (hidden when location.pathname is inside /beta/),
# so promotion is a clean file copy - no hand-reconciliation of the button.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Test-Path "beta/js/game.js")) { throw "No beta/ build found at beta/js/game.js." }

Write-Host "Promoting beta/ -> live root ..." -ForegroundColor Cyan

# 1. Payload copies
Copy-Item "beta/js/game.js"   "js/game.js"   -Force
Copy-Item "beta/version.json" "version.json" -Force
Copy-Item "beta/css/*"        "css/"         -Recurse -Force
Copy-Item "beta/config/*.json" "config/"     -Force

# 2. index.html - take beta's shell (so structural changes carry over), strip BETA branding
$html = Get-Content "beta/index.html" -Raw -Encoding UTF8
$html = $html -replace '<title>[^<]*</title>', '<title>Entrepreneur Paradise</title>'
$html = $html -replace '<h1>Entrepreneur Paradise[^\n]*?</h1>', '<h1>Entrepreneur Paradise</h1>'
$html = $html -replace '\s*<span[^>]*>[^<]*Testing build</span>', ''
$html | Out-File "index.html" -Encoding utf8 -NoNewline

# 3. Rebuild the standalone offline root game.html from the freshly-copied sources
& "$root\build.ps1"

# 4. Sanity checks - live root must NOT carry BETA branding, and version must match
$liveIdx = Get-Content "index.html" -Raw -Encoding UTF8
if ($liveIdx -match 'BETA' -or $liveIdx -match 'Testing build') {
    Write-Warning "index.html STILL contains BETA branding - the branding HTML likely changed in beta; reconcile manually before committing."
}
$v = (Get-Content "version.json" -Raw -Encoding UTF8 | ConvertFrom-Json).v
Write-Host "Promoted. Live root is now v$v." -ForegroundColor Green
Write-Host "NEXT (the /promote command handles these): add a RELEASE_NOTES.md entry, verify root in preview (load '/', check version line + Beta button + no console errors), commit, then push only after owner confirms." -ForegroundColor Yellow
