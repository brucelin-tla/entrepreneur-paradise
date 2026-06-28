# serve.ps1 — minimal static file server (no Node/Python required).
# Serves the project directory over HTTP for local preview/testing.
#   .\serve.ps1            -> localhost only (desktop preview)
#   .\serve.ps1 -Lan       -> all interfaces, so a phone on the same Wi-Fi can reach it
#                             (needs the one-time admin setup below; run elevated the first time)
param([int]$Port = 3000, [switch]$Lan)
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
if ($Lan) {
    # Bind every interface. Requires either an elevated shell or a one-time URL ACL reservation:
    #   netsh http add urlacl url=http://+:3000/ user=Everyone
    # and a firewall opening:
    #   netsh advfirewall firewall add rule name="EP Game 3000" dir=in action=allow protocol=TCP localport=3000
    $listener.Prefixes.Add("http://+:$Port/")
} else {
    $listener.Prefixes.Add("http://localhost:$Port/")
}
$listener.Start()
if ($Lan) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -First 1).IPAddress
    Write-Host "Serving $root on the LAN. On your phone (same Wi-Fi) open: http://${ip}:$Port/"
} else {
    Write-Host "Serving $root at http://localhost:$Port/"
}
$mime = @{ ".html"="text/html"; ".js"="application/javascript"; ".css"="text/css"; ".json"="application/json"; ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon" }
while ($listener.IsListening) {
    try {
        $ctx = $listener.GetContext()
        $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
        if ([string]::IsNullOrEmpty($rel)) { $rel = "index.html" }
        $path = Join-Path $root $rel
        if (Test-Path $path -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($path)
            $ext = [System.IO.Path]::GetExtension($path).ToLower()
            if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
            $ctx.Response.StatusCode = 200
            $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $ctx.Response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
            $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $ctx.Response.OutputStream.Close()
    } catch { }
}
