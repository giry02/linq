$ErrorActionPreference = "Stop"

$fixtureRoot = Join-Path $PSScriptRoot "..\html\fleet-data"
$authRecord = Get-ChildItem -LiteralPath $fixtureRoot -Filter "*.json" -File |
  ForEach-Object {
    $record = Get-Content -LiteralPath $_.FullName -Raw -Encoding utf8 | ConvertFrom-Json
    if ($record.path -eq "/common/auth/fleet/authenticate") { $record }
  } |
  Select-Object -First 1

if (-not $authRecord) { throw "Captured authentication response was not found." }
$authPayload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($authRecord.body)) | ConvertFrom-Json
$accessToken = $authPayload.result.access_token
if (-not $accessToken) { throw "Captured access token was not found." }

$headers = @{ Authorization = "Bearer $accessToken" }
$baseUrl = "http://localhost:3000/api"
$startDate = "20260801"
$endDate = "20260813"
$groups = @(1948, 34304)
$results = [System.Collections.Generic.List[object]]::new()

function Capture-Endpoint([string]$Path) {
  try {
    $response = Invoke-WebRequest -Uri ($baseUrl + $Path) -Headers $headers -UseBasicParsing -TimeoutSec 30
    $apiCode = $null
    try { $apiCode = ($response.Content | ConvertFrom-Json).code } catch {}
    $results.Add([pscustomobject]@{ Path = $Path; Http = $response.StatusCode; Code = $apiCode })
    return $response.Content
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    $results.Add([pscustomobject]@{ Path = $Path; Http = $status; Code = "ERROR" })
    return $null
  }
}

foreach ($groupId in $groups) {
  Capture-Endpoint "/fleet/analysis/shock/ranking/group/${groupId}?periodTypeCode=monthly&startDate=${startDate}" | Out-Null
  Capture-Endpoint "/fleet/analysis/shock/graph/group/${groupId}?equipmentId=&periodTypeCode=monthly&startDate=${startDate}" | Out-Null
  Capture-Endpoint "/fleet/analysis/fuel/summary/group/${groupId}?equipmentId=&periodTypeCode=monthly&startDate=${startDate}" | Out-Null
  Capture-Endpoint "/fleet/analysis/fuel/graph/group/${groupId}?equipmentId=&periodTypeCode=monthly&startDate=${startDate}" | Out-Null

  $liFirst = Capture-Endpoint "/fleet/analysis/li/stat/group/${groupId}?pageNo=1&pageSize=10"
  Capture-Endpoint "/fleet/analysis/li/stat/group/${groupId}?pageNo=2&pageSize=10" | Out-Null
  Capture-Endpoint "/fleet/analysis/hi/stat/group/${groupId}?pageNo=1&pageSize=10" | Out-Null
  Capture-Endpoint "/fleet/analysis/hi/stat/group/${groupId}?pageNo=2&pageSize=10" | Out-Null

  Capture-Endpoint "/fleet/report/summary?groupId=${groupId}&periodTypeCode=monthly&startDate=${startDate}" | Out-Null
  Capture-Endpoint "/fleet/report/summary/graph?groupId=${groupId}&periodTypeCode=monthly&startDate=${startDate}" | Out-Null
  Capture-Endpoint "/common/workingtime/group/${groupId}/current" | Out-Null
  Capture-Endpoint "/common/map/geofence/group/${groupId}" | Out-Null
  Capture-Endpoint "/common/map/geofence/group/equipments?groupId=${groupId}" | Out-Null

  if ($liFirst) {
    $liPayload = $liFirst | ConvertFrom-Json
    $firstVehicle = @($liPayload.result) | Where-Object { $_.equipmentId } | Select-Object -First 1
    if ($firstVehicle) {
      $equipmentId = $firstVehicle.equipmentId
      Capture-Endpoint "/fleet/analysis/li/stat/equipment/${equipmentId}" | Out-Null
      Capture-Endpoint "/fleet/analysis/li/error/group/${groupId}?equipmentId=${equipmentId}&periodTypeCode=monthly&startDate=${startDate}&endDate=${endDate}" | Out-Null
      Capture-Endpoint "/fleet/analysis/li/graph/charge/group/${groupId}?equipmentId=${equipmentId}&periodTypeCode=monthly&startDate=${startDate}&endDate=${endDate}" | Out-Null
    }
  }
}

Capture-Endpoint "/fleet/report/diffgroup?groupIds=1948,34304&periodTypeCode=monthly&startDate=${startDate}" | Out-Null
Capture-Endpoint "/fleet/report/diffgroup/graph?groupIds=1948,34304&periodTypeCode=monthly&startDate=${startDate}" | Out-Null
Capture-Endpoint "/fleet/report/heatmap/graph?groupIds=1948,34304&periodTypeCode=monthly&startDate=${startDate}" | Out-Null

Capture-Endpoint "/fleet/admin/companies?searchKeyword=&sortCol=companyId%20DESC&pageNo=1&pageSize=20" | Out-Null
Capture-Endpoint "/fleet/admin/groups?searchKeyword=&sortCol=groupId%20DESC&pageNo=1&pageSize=20" | Out-Null
Capture-Endpoint "/fleet/admin/equipments?searchKeyword=&sortCol=equipmentId%20DESC&pageNo=1&pageSize=20" | Out-Null
Capture-Endpoint "/fleet/admin/account/requests" | Out-Null
Capture-Endpoint "/fleet/admin/equipment/requests" | Out-Null

$summaryPath = Join-Path $PSScriptRoot "..\html\capture-summary.json"
$results | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $summaryPath -Encoding utf8
$results | Group-Object Http | Select-Object Name, Count
