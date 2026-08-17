param(
  [ValidateSet("fleet", "dealer")]
  [string]$Site = "fleet"
)

$ErrorActionPreference = "Stop"
$siteRoot = Join-Path $PSScriptRoot "..\html\$Site"
$bundle = Join-Path $siteRoot "assets\index-dGkWfo-f.js"
$original = Join-Path $siteRoot "assets\index-dGkWfo-f.original.js"

if (-not (Test-Path -LiteralPath $original)) {
  Copy-Item -LiteralPath $bundle -Destination $original
}

$source = Get-Content -LiteralPath $original -Raw -Encoding utf8
$patched = $source.Replace('baseURL:"https://machineiq.bobcat.com/api"', 'baseURL:"/api"')
if ($patched -eq $source) {
  throw "The production API base URL was not found in the client bundle."
}

[System.IO.File]::WriteAllText($bundle, $patched, [System.Text.UTF8Encoding]::new($false))
Write-Output "Prepared local API endpoint in $bundle"
