# =====================================================
# Test Alerts API - PowerShell Script
# =====================================================

# Configuration
$ApiBaseUrl = "https://localhost:7001"
$HouseholdId = "YOUR_HOUSEHOLD_ID_HERE"  # Replace with your actual household ID
$Token = "YOUR_JWT_TOKEN_HERE"  # Optional: Replace with your JWT token if auth is enabled

Write-Host "🔔 Testing Butler Alerts System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Headers
$headers = @{}
if ($Token -ne "YOUR_JWT_TOKEN_HERE") {
    $headers["Authorization"] = "Bearer $Token"
    Write-Host "✅ Using authentication token" -ForegroundColor Green
} else {
    Write-Host "⚠️  No authentication token (will work if auth is disabled)" -ForegroundColor Yellow
}

# Disable SSL certificate validation for localhost testing
if ($PSVersionTable.PSVersion.Major -ge 6) {
    # PowerShell Core
    Invoke-WebRequest -Uri $ApiBaseUrl -SkipCertificateCheck -ErrorAction SilentlyContinue | Out-Null
} else {
    # Windows PowerShell
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
}

Write-Host ""
Write-Host "📊 Test 1: Generate All Alerts" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$ApiBaseUrl/api/Alerts/generate/all/$HouseholdId" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json"
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Total Generated: $($response.totalGenerated)" -ForegroundColor Cyan
    Write-Host "   By Category:" -ForegroundColor Cyan
    $response.byCategory.PSObject.Properties | ForEach-Object {
        Write-Host "      - $($_.Name): $($_.Value)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Test 2: Get All Alerts" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $alerts = Invoke-RestMethod -Uri "$ApiBaseUrl/api/Alerts/household/$HouseholdId" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Found $($alerts.Count) alerts" -ForegroundColor Green
    
    if ($alerts.Count -gt 0) {
        Write-Host ""
        Write-Host "   Recent Alerts:" -ForegroundColor Cyan
        $alerts | Select-Object -First 5 | ForEach-Object {
            Write-Host "   • [$($_.severity)] $($_.title)" -ForegroundColor White
            Write-Host "     $($_.message)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Test 3: Get Alert Statistics" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $stats = Invoke-RestMethod -Uri "$ApiBaseUrl/api/Alerts/household/$HouseholdId/stats" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Statistics Retrieved:" -ForegroundColor Green
    Write-Host "   Total Alerts: $($stats.totalAlerts)" -ForegroundColor Cyan
    Write-Host "   Unread Alerts: $($stats.unreadAlerts)" -ForegroundColor Cyan
    Write-Host "   Critical Alerts: $($stats.criticalAlerts)" -ForegroundColor Red
    Write-Host "   High Priority: $($stats.highPriorityAlerts)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   By Category:" -ForegroundColor Cyan
    $stats.alertsByCategory.PSObject.Properties | ForEach-Object {
        Write-Host "      - $($_.Name): $($_.Value)" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "   By Severity:" -ForegroundColor Cyan
    $stats.alertsBySeverity.PSObject.Properties | ForEach-Object {
        Write-Host "      - $($_.Name): $($_.Value)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test 4: Get Unread Alerts" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $unread = Invoke-RestMethod -Uri "$ApiBaseUrl/api/Alerts/household/$HouseholdId/unread" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Found $($unread.Count) unread alerts" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Test 5: Get Alerts by Category" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

$categories = @("Bills", "Healthcare", "Budget", "Maintenance")
foreach ($category in $categories) {
    try {
        $categoryAlerts = Invoke-RestMethod -Uri "$ApiBaseUrl/api/Alerts/household/$HouseholdId/category/$category" `
            -Method Get `
            -Headers $headers
        
        if ($categoryAlerts.Count -gt 0) {
            Write-Host "   $category : $($categoryAlerts.Count) alerts" -ForegroundColor Green
        }
    } catch {
        Write-Host "   $category : 0 alerts" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🚨 Test 6: Get Critical Alerts" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

try {
    $critical = Invoke-RestMethod -Uri "$ApiBaseUrl/api/Alerts/household/$HouseholdId/severity/Critical" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Found $($critical.Count) critical alerts" -ForegroundColor Green
    
    if ($critical.Count -gt 0) {
        Write-Host ""
        Write-Host "   ⚠️  CRITICAL ALERTS:" -ForegroundColor Red
        $critical | ForEach-Object {
            Write-Host "   • $($_.title)" -ForegroundColor Red
            Write-Host "     $($_.message)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check the API logs for background service activity"
Write-Host "   2. Open Swagger UI at $ApiBaseUrl/swagger"
Write-Host "   3. Review ALERTS-SETUP-GUIDE.md for more details"
Write-Host ""

# Restore SSL validation
if ($PSVersionTable.PSVersion.Major -lt 6) {
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = $null
}

