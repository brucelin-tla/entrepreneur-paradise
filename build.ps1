# build.ps1 — produces a standalone offline game.html from the modular sources.
# The live site (GitHub Pages) uses index.html + css/ + js/ + config/ directly.
# game.html is a single self-contained file that also works from file:// (offline),
# because config is inlined as window.EMBEDDED_CONFIG (loadConfig's fallback).
#
# Idempotent: always rebuilds game.html fresh from index.html. Running it
# repeatedly will NOT accumulate duplicate config blobs.

$ErrorActionPreference = "Stop"
$configDir = "config"
$files = @(
    "starting_positions","actions_marketing","actions_operations",
    "actions_finance","lifestyle_options","events",
    "stage_thresholds","scoring_weights","archetypes",
    "characters","narrative_beats"
)

# 1. Build the embedded config object from the JSON source of truth.
$embedded = "window.EMBEDDED_CONFIG = {`n"
foreach ($f in $files) {
    $json = Get-Content "$configDir\$f.json" -Raw -Encoding UTF8
    $embedded += "  `"$f`": $json,`n"
}
$embedded += "};"

# 2. Read the modular assets.
$css  = Get-Content "css\styles.css" -Raw -Encoding UTF8
$js   = Get-Content "js\game.js"     -Raw -Encoding UTF8
$html = Get-Content "index.html"     -Raw -Encoding UTF8

# 3. Inline CSS in place of the stylesheet link.
$cssLink = '<link rel="stylesheet" href="css/styles.css">'
$html = $html.Replace($cssLink, "<style>`n$css`n</style>")

# 4. Inline embedded config + game code in place of the script src.
$jsTag = '<script src="js/game.js"></script>'
$html = $html.Replace($jsTag, "<script>`n$embedded`n$js`n</script>")

# 5. Write the standalone file.
$html | Out-File "game.html" -Encoding utf8 -NoNewline
Write-Host "Built game.html (standalone, offline-capable)"
