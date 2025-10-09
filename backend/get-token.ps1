# Quick script to sign up a test user and get a JWT token from Supabase

$supabaseUrl = "https://cwvkrkiejntyexfxzxpx.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmtya2llam50eWV4Znh6eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Nzc5NDksImV4cCI6MjA3NTU1Mzk0OX0.mTYN5JRhJDrs1XUblMnUJzVVp0rUR-j9mKiX62b-Kbs"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Supabase Auth Token Generator" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get user input
$email = Read-Host "Enter email for test user (e.g., test@example.com)"
$password = Read-Host "Enter password (min 6 characters)" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Attempting to sign up user..." -ForegroundColor Yellow

# Try to sign up
$signupBody = @{
    email = $email
    password = $passwordPlain
} | ConvertTo-Json

$token = $null

try {
    $signupResponse = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/signup" `
        -Method POST `
        -Headers @{
            "apikey" = $anonKey
            "Content-Type" = "application/json"
        } `
        -Body $signupBody
    
    if ($signupResponse.access_token) {
        Write-Host "Success! User created." -ForegroundColor Green
        $token = $signupResponse.access_token
    }
}
catch {
    $errorMessage = $_.ErrorDetails.Message
    
    if ($errorMessage -like "*already*registered*" -or $errorMessage -like "*User already*") {
        Write-Host "User already exists. Attempting to sign in..." -ForegroundColor Yellow
        
        $signinBody = @{
            email = $email
            password = $passwordPlain
        } | ConvertTo-Json
        
        try {
            $signinResponse = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/token?grant_type=password" `
                -Method POST `
                -Headers @{
                    "apikey" = $anonKey
                    "Content-Type" = "application/json"
                } `
                -Body $signinBody
            
            if ($signinResponse.access_token) {
                Write-Host "Success! Signed in." -ForegroundColor Green
                $token = $signinResponse.access_token
            }
        }
        catch {
            Write-Host "Sign in failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
            exit 1
        }
    }
    else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Details: $errorMessage" -ForegroundColor Red
        exit 1
    }
}

if ($token) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "YOUR JWT ACCESS TOKEN:" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host $token -ForegroundColor Yellow
    Write-Host ""
    Write-Host "How to use in Swagger:" -ForegroundColor Cyan
    Write-Host "1. Open http://localhost:5000/swagger" -ForegroundColor White
    Write-Host "2. Click the Authorize button (padlock icon)" -ForegroundColor White
    Write-Host "3. In the Value field, enter: Bearer [paste-your-token]" -ForegroundColor White
    Write-Host "4. Click Authorize" -ForegroundColor White
    Write-Host ""
    
    # Save to file
    $token | Out-File -FilePath "token.txt" -NoNewline -Encoding UTF8
    Write-Host "Token also saved to: token.txt" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "Failed to get token." -ForegroundColor Red
    exit 1
}
