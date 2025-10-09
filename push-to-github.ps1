# Push The Butler to GitHub
# This script organizes and pushes both Angular and API code to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  The Butler - GitHub Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "C:\Users\deric\source\repos\StudioXConsulting\Projects\TheButler"
$backendPath = "C:\Users\deric\source\repos\TheButlerApi"
$repoUrl = "https://github.com/DerickMayberry68/TheButler.git"

# Step 1: Initialize git in frontend directory (if not already)
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
Set-Location $frontendPath

# Check if .git exists
if (-Not (Test-Path ".git")) {
    git init
    Write-Host "[OK] Git initialized" -ForegroundColor Green
} else {
    Write-Host "[OK] Git already initialized" -ForegroundColor Green
}

# Step 2: Add remote (if not already added)
Write-Host ""
Write-Host "Step 2: Adding GitHub remote..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -notcontains "origin") {
    git remote add origin $repoUrl
    Write-Host "[OK] Remote origin added" -ForegroundColor Green
} else {
    Write-Host "[OK] Remote origin already exists" -ForegroundColor Green
    # Update remote URL just in case
    git remote set-url origin $repoUrl
}

# Step 3: Create backend directory in repo and copy API code
Write-Host ""
Write-Host "Step 3: Organizing project structure..." -ForegroundColor Yellow

# Rename current content to 'frontend' if it's not already
if (-Not (Test-Path "frontend")) {
    Write-Host "Creating frontend directory structure..." -ForegroundColor Gray
    
    # Create a temporary directory
    New-Item -ItemType Directory -Path "temp_frontend" -Force | Out-Null
    
    # Move Angular files to temp_frontend (excluding git files)
    Get-ChildItem -Path $frontendPath -Exclude ".git", "temp_frontend", "backend", "push-to-github.ps1" | 
        ForEach-Object { Move-Item $_.FullName -Destination "temp_frontend" -Force }
    
    # Rename temp_frontend to frontend
    Rename-Item -Path "temp_frontend" -NewName "frontend"
    
    Write-Host "[OK] Frontend organized" -ForegroundColor Green
} else {
    Write-Host "[OK] Frontend directory already exists" -ForegroundColor Green
}

# Step 4: Copy backend code
Write-Host ""
Write-Host "Step 4: Copying backend code..." -ForegroundColor Yellow

if (Test-Path $backendPath) {
    # Create backend directory if it doesn't exist
    if (-Not (Test-Path "backend")) {
        New-Item -ItemType Directory -Path "backend" -Force | Out-Null
    }
    
    # Copy all backend files except .git, bin, obj directories
    Write-Host "Copying API code..." -ForegroundColor Gray
    Copy-Item -Path "$backendPath\*" -Destination "backend" -Recurse -Force -Exclude @("bin", "obj", ".vs", ".git")
    
    Write-Host "[OK] Backend code copied" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Backend path not found: $backendPath" -ForegroundColor Red
    Write-Host "Please ensure the path is correct" -ForegroundColor Red
    exit
}

# Step 5: Stage all files
Write-Host ""
Write-Host "Step 5: Staging files..." -ForegroundColor Yellow
git add -A
Write-Host "[OK] Files staged" -ForegroundColor Green

# Step 6: Commit changes
Write-Host ""
Write-Host "Step 6: Committing changes..." -ForegroundColor Yellow
$commitMessage = "Initial commit: Angular frontend and .NET API"
git commit -m $commitMessage

# Check if main branch exists, otherwise create it
$currentBranch = git branch --show-current
if ([string]::IsNullOrEmpty($currentBranch)) {
    Write-Host "Creating main branch..." -ForegroundColor Gray
    git branch -M main
    $currentBranch = "main"
}

Write-Host "[OK] Changes committed to branch: $currentBranch" -ForegroundColor Green

# Step 7: Push to GitHub
Write-Host ""
Write-Host "Step 7: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "This may ask for your GitHub credentials..." -ForegroundColor Gray

$pushResult = git push -u origin $currentBranch 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Error details: $pushResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to:" -ForegroundColor Yellow
    Write-Host "1. Create the repository on GitHub first" -ForegroundColor White
    Write-Host "2. Check your credentials" -ForegroundColor White
    Write-Host "3. Ensure you have permission to push" -ForegroundColor White
}

Write-Host ""
Write-Host "Final repository structure:" -ForegroundColor Yellow
Write-Host "TheButler/" -ForegroundColor Cyan
Write-Host "  - frontend/ (Angular app)" -ForegroundColor Gray
Write-Host "  - backend/ (dotNET API)" -ForegroundColor Gray
Write-Host "  - .gitignore" -ForegroundColor Gray
Write-Host "  - README.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit: https://github.com/DerickMayberry68/TheButler" -ForegroundColor White
Write-Host "2. Set up GitHub Actions for CI/CD (optional)" -ForegroundColor White
Write-Host "3. Configure deployment (Vercel, Azure, etc.)" -ForegroundColor White
Write-Host ""
