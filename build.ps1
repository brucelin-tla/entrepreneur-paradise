$configDir = "config"
$files = @(
    "starting_positions","actions_marketing","actions_operations",
    "actions_finance","lifestyle_options","events",
    "stage_thresholds","scoring_weights","archetypes",
    "characters","narrative_beats"
)

$embedded = "window.EMBEDDED_CONFIG = {`n"
foreach ($f in $files) {
    $json = Get-Content "$configDir\$f.json" -Raw -Encoding UTF8
    $embedded += "  `"$f`": $json,`n"
}
$embedded += "};"

$html = Get-Content "index.html" -Raw -Encoding UTF8
$tag = "<script>"
$replacement = "<script>`n$embedded`n"
$idx = $html.IndexOf($tag)
if ($idx -ge 0) {
    $html = $html.Substring(0, $idx) + $replacement + $html.Substring($idx + $tag.Length)
}

$html | Out-File "game.html" -Encoding utf8
Write-Host "Built game.html successfully"
