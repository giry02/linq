param(
  [string]$Destination = (Join-Path $PSScriptRoot "..\html\fleet")
)

$ErrorActionPreference = "Stop"
$remoteRoot = "https://machineiq.bobcat.com/fleet/"
$assetRoot = "${remoteRoot}assets/"
$destinationRoot = [System.IO.Path]::GetFullPath($Destination)
$assetDirectory = Join-Path $destinationRoot "assets"
$downloaded = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$failed = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$extensions = "js|css|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|ico|webp|avif|json"

New-Item -ItemType Directory -Path $assetDirectory -Force | Out-Null
Invoke-WebRequest -Uri $remoteRoot -OutFile (Join-Path $destinationRoot "index.html") -UseBasicParsing
Invoke-WebRequest -Uri "${remoteRoot}favicon.ico" -OutFile (Join-Path $destinationRoot "favicon.ico") -UseBasicParsing

Get-ChildItem -LiteralPath $assetDirectory -Directory -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
Get-ChildItem -LiteralPath $assetDirectory -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name.StartsWith('.') -or $_.Name -eq '-i-t.css' -or $_.Name -eq '1624.svg' } |
  Remove-Item -Force

function Add-Candidate([System.Collections.Generic.HashSet[string]]$Set, [string]$Name) {
  if ([string]::IsNullOrWhiteSpace($Name)) { return }
  $clean = [System.IO.Path]::GetFileName($Name.Split('?')[0].Split('#')[0])
  if ($clean -match "^[A-Za-z0-9_][A-Za-z0-9@._-]*\.($extensions)$") {
    [void]$Set.Add($clean)
  }
}

$pending = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$indexSource = Get-Content -LiteralPath (Join-Path $destinationRoot "index.html") -Raw -Encoding utf8
foreach ($match in [regex]::Matches($indexSource, "/fleet/assets/(?<name>[A-Za-z0-9@._-]+\.($extensions))")) {
  Add-Candidate $pending $match.Groups['name'].Value
}

$changed = $true
while ($changed) {
  $changed = $false

  foreach ($name in @($pending)) {
    $localPath = Join-Path $assetDirectory $name
    if (-not (Test-Path -LiteralPath $localPath)) {
      try {
        Invoke-WebRequest -Uri ($assetRoot + $name) -OutFile $localPath -UseBasicParsing -TimeoutSec 20
        $changed = $true
      } catch {
        [void]$failed.Add($name)
        if (Test-Path -LiteralPath $localPath) { Remove-Item -LiteralPath $localPath -Force }
      }
    }
    if (Test-Path -LiteralPath $localPath) { [void]$downloaded.Add($name) }
  }

  $next = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  Get-ChildItem -LiteralPath $assetDirectory -File |
    Where-Object { $_.Extension -in @('.js', '.css', '.json', '.svg') } |
    ForEach-Object {
      $source = Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8
      $patterns = @(
        "/fleet/assets/(?<name>[A-Za-z0-9@._-]+\.($extensions))",
        "(?:\./)?(?<name>[A-Za-z0-9_][A-Za-z0-9@._-]*-[A-Za-z0-9_-]{6,}\.($extensions))",
        "url\([`"']?(?:\./)?(?<name>[A-Za-z0-9_][A-Za-z0-9@._-]*\.($extensions))"
      )
      foreach ($pattern in $patterns) {
        foreach ($match in [regex]::Matches($source, $pattern)) {
          Add-Candidate $next $match.Groups['name'].Value
        }
      }
    }

  $pending = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  foreach ($name in $next) {
    if (-not $downloaded.Contains($name) -and -not $failed.Contains($name)) {
      [void]$pending.Add($name)
    }
  }
  if ($pending.Count -gt 0) { $changed = $true }
}

$manifest = [ordered]@{
  source = $remoteRoot
  capturedAt = (Get-Date).ToString('o')
  files = (Get-ChildItem -LiteralPath $destinationRoot -Recurse -File | ForEach-Object {
    $_.FullName.Substring($destinationRoot.Length + 1).Replace('\\', '/')
  })
  failed = @($failed)
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $destinationRoot "mirror-manifest.json") -Encoding utf8

[pscustomobject]@{
  Destination = $destinationRoot
  Files = $manifest.files.Count
  Failed = $failed.Count
}
