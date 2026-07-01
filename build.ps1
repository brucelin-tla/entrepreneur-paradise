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

# 3. Inline CSS in place of the stylesheet loader. (Live index.html uses a tiny loader that
#    cache-busts css/js on update; the offline build just inlines them directly.)
$cssLink = @'
<script>window.__q=(new URLSearchParams(location.search).get('u')?('?u='+new URLSearchParams(location.search).get('u')):'');document.write('<link rel="stylesheet" href="css/styles.css'+window.__q+'">');</script>
'@
$html = $html.Replace($cssLink, "<style>`n$css`n</style>")

# 4. Inline embedded config + game code in place of the script loader.
$jsTag = @'
<script>document.write('<script src="js/game.js'+(window.__q||'')+'"><\/script>');</script>
'@
$html = $html.Replace($jsTag, "<script>`n$embedded`n$js`n</script>")

# 4b. Safety: the offline build must not still contain an external loader/ref to js/game.js or css/styles.css.
if ($html -match 'src="js/game.js' -or $html -match 'href="css/styles.css') {
    throw "build.ps1: failed to inline css/js - the index.html loader tags may have changed; update the match strings above."
}

# 5. Write the standalone file.
$html | Out-File "game.html" -Encoding utf8 -NoNewline
Write-Host "Built game.html (standalone, offline-capable)"
