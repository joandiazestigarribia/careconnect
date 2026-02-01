$BASE_URL = "http://localhost:3001"

Write-Host "🔍 Testing CareConnect Search & Profiles API" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Testing GET /caregiver-profiles (public)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/caregiver-profiles" -Method GET
    Write-Host "   ✅ Found $($response.data.length) caregivers" -ForegroundColor Green
    
    if ($response.data.length -gt 0) {
        $first = $response.data[0]
        Write-Host "   First: $($first.first_name) $($first.last_name) - `$$("$first.hourly_rate)/h" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

Write-Host "2️⃣  Testing GET /family-profiles (protected - need token)..." -ForegroundColor Yellow
Write-Host "   Login first to get token..." -ForegroundColor Gray

try {
    $loginBody = @{
        email = "familia1@test.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.data.access_token
    Write-Host "   ✅ Logged in as familia1@test.com" -ForegroundColor Green

    $headers = @{ "Authorization" = "Bearer $token" }
    
    Write-Host ""
    Write-Host "3️⃣  Testing GET /family-profiles/me..." -ForegroundColor Yellow
    $meResponse = Invoke-RestMethod -Uri "$BASE_URL/family-profiles/me" -Method GET -Headers $headers
    Write-Host "   ✅ Family profile: $($meResponse.data.family_name)" -ForegroundColor Green
    Write-Host "   Address: $($meResponse.data.address)" -ForegroundColor Gray

    Write-Host ""
    Write-Host "4️⃣  Testing GET /caregiver-profiles/:id (first caregiver)..." -ForegroundColor Yellow
    $caregiversResponse = Invoke-RestMethod -Uri "$BASE_URL/caregiver-profiles" -Method GET
    if ($caregiversResponse.data.length -gt 0) {
        $firstId = $caregiversResponse.data[0].user_id
        $caregiverResponse = Invoke-RestMethod -Uri "$BASE_URL/caregiver-profiles/$firstId" -Method GET
        Write-Host "   ✅ Caregiver details: $($caregiverResponse.data.first_name) $($caregiverResponse.data.last_name)" -ForegroundColor Green
        Write-Host "   Skills: $($caregiverResponse.data.skills -join ', ')" -ForegroundColor Gray
    }

} catch {
    Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✨ Search & Profile tests completed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
