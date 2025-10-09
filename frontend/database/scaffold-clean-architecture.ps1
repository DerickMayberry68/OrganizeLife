# =====================================================
# TheButler - Clean Architecture Scaffolding Script
# =====================================================
# This script scaffolds the database and organizes files
# according to Clean Architecture principles
# =====================================================

param(
    [string]$ConnectionString = "",
    [string]$SolutionRoot = (Get-Location).Path,
    [switch]$Help
)

# Define exit codes for different error conditions
$EXIT_CODE_MISSING_PROJECT = 1
$EXIT_CODE_SCAFFOLDING_FAILED = 2
$EXIT_CODE_FILE_NOT_FOUND = 3

if ($Help) {
    Write-Host @"
Usage: .\scaffold-clean-architecture.ps1 -ConnectionString "Host=...;Database=..." [-SolutionRoot "path"]

Parameters:
  -ConnectionString    Required. Your Supabase connection string
  -SolutionRoot       Optional. Path to your solution root (default: current directory)
  -Help               Show this help message

Example:
  .\scaffold-clean-architecture.ps1 -ConnectionString "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YourPass;SSL Mode=Require;Trust Server Certificate=true"
"@
    exit 0
}

if ([string]::IsNullOrEmpty($ConnectionString)) {
    Write-Host "ERROR: -ConnectionString parameter is required" -ForegroundColor Red
    Write-Host "Run with -Help for usage information" -ForegroundColor Yellow
    exit 1
}

# Define paths
$infraProject = Join-Path $SolutionRoot "src/TheButler.Infrastructure"
$coreProject = Join-Path $SolutionRoot "src/TheButler.Core"
$apiProject = Join-Path $SolutionRoot "src/TheButler.Api"

# Verify projects exist
if (-not (Test-Path $infraProject)) {
    Write-Host "ERROR: Infrastructure project not found at: $infraProject" -ForegroundColor Red
    exit $EXIT_CODE_MISSING_PROJECT
}

if (-not (Test-Path $coreProject)) {
    Write-Host "ERROR: Core project not found at: $coreProject" -ForegroundColor Red
    exit $EXIT_CODE_MISSING_PROJECT
}

if (-not (Test-Path $apiProject)) {
    Write-Host "ERROR: API project not found at: $apiProject" -ForegroundColor Red
    exit $EXIT_CODE_MISSING_PROJECT
}

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   TheButler - Clean Architecture Scaffolding      ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Step 1: Scaffold to Infrastructure/Temp
Write-Host "Step 1: Scaffolding database..." -ForegroundColor Yellow
Set-Location $infraProject

$tempDir = Join-Path $infraProject "Temp"
$dataDir = Join-Path $infraProject "Data"

# Create directories if they don't exist
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

# Validate dotnet CLI and dotnet-ef
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: dotnet CLI not found. Please ensure the .NET SDK is installed." -ForegroundColor Red
    exit $EXIT_CODE_SCAFFOLDING_FAILED
}
if (-not (dotnet tool list -g | Select-String "dotnet-ef")) {
    Write-Host "ERROR: dotnet-ef not installed. Install it using 'dotnet tool install --global dotnet-ef'" -ForegroundColor Red
    exit $EXIT_CODE_SCAFFOLDING_FAILED
}

# Run dotnet ef command and capture output
$output = dotnet ef dbcontext scaffold $ConnectionString `
    Npgsql.EntityFrameworkCore.PostgreSQL `
    --startup-project $apiProject `
    --output-dir Temp `
    --context-dir Data `
    --context TheButlerDbContext `
    --schema public `
    --no-onconfiguring `
    --force `
    --no-pluralize 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Scaffolding failed: $output" -ForegroundColor Red
    exit $EXIT_CODE_SCAFFOLDING_FAILED
}

Write-Host "Database scaffolded successfully" -ForegroundColor Green

# Step 2: Move entities to Core project
Write-Host ""
Write-Host "Step 2: Moving entities to Core project..." -ForegroundColor Yellow

$modelDir = Join-Path $coreProject "Domain/Model"
New-Item -ItemType Directory -Force -Path $modelDir | Out-Null

Get-ChildItem -Path $tempDir -Filter "*.cs" | ForEach-Object {
    $destPath = Join-Path $modelDir $_.Name
    
    # Read content and update namespace
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'namespace\s+TheButler\.Infrastructure\.Temp\s*;', 'namespace TheButler.Core.Domain.Model;'
    
    # Write to Core project
    Set-Content -Path $destPath -Value $content
    $fileName = $_.Name
    Write-Host "  Moved $fileName" -ForegroundColor Gray
}

Write-Host "Entities moved to Core project" -ForegroundColor Green

# Step 3: Generate IEntityTypeConfiguration files
Write-Host ""
Write-Host "Step 3: Generating IEntityTypeConfiguration files..." -ForegroundColor Yellow

$configDir = Join-Path $infraProject "DataAccess/Config"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null

$entities = Get-ChildItem -Path $modelDir -Filter "*.cs"

foreach ($entity in $entities) {
    $entityName = [System.IO.Path]::GetFileNameWithoutExtension($entity.Name)
    $configFileName = "$($entityName)Configuration.cs"
    $configPath = Join-Path $configDir $configFileName
    
    # Build configuration content using -f format operator
    $configContent = @'
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Config;

public class {0}Configuration : IEntityTypeConfiguration<{0}>
{{
    public void Configure(EntityTypeBuilder<{0}> builder)
    {{
        // TODO: Configure entity mappings here
        // This will be populated from scaffolded DbContext
    }}
}}
'@ -f $entityName
    
    Set-Content -Path $configPath -Value $configContent
    Write-Host "  Created $configFileName" -ForegroundColor Gray
}

Write-Host "IEntityTypeConfiguration files generated" -ForegroundColor Green

# Step 4: Update DbContext
Write-Host ""
Write-Host "Step 4: Updating DbContext..." -ForegroundColor Yellow

$dbContextPath = Join-Path $dataDir "TheButlerDbContext.cs"

if (-not (Test-Path $dbContextPath)) {
    Write-Host "ERROR: DbContext file not found at: $dbContextPath" -ForegroundColor Red
    exit $EXIT_CODE_FILE_NOT_FOUND
}

$dbContextContent = Get-Content $dbContextPath -Raw

# Update namespace
$dbContextContent = $dbContextContent -replace 'namespace\s+TheButler\.Infrastructure\.Data\s*;', 'namespace TheButler.Infrastructure.Data;'

# Update using statements
if ($dbContextContent -notmatch 'using TheButler\.Core\.Domain\.Model;') {
    $dbContextContent = $dbContextContent -replace '(\s*using\s+[^;]+;\s*)+', '$&using TheButler.Core.Domain.Model;`nusing TheButler.Infrastructure.DataAccess.Config;`n'
}

# Add ApplyConfigurationsFromAssembly to OnModelCreating
if ($dbContextContent -match 'protected override void OnModelCreating\(ModelBuilder modelBuilder\)') {
    if ($dbContextContent -notmatch 'ApplyConfigurationsFromAssembly') {
        $methodReplacement = '$1' + [Environment]::NewLine + '        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TheButlerDbContext).Assembly);'
        $dbContextContent = $dbContextContent -replace '(protected override void OnModelCreating\(ModelBuilder modelBuilder\)\s*\{)', $methodReplacement
    }
}

Set-Content -Path $dbContextPath -Value $dbContextContent
Write-Host "DbContext updated" -ForegroundColor Green

# Step 5: Clean up temp directory
Write-Host ""
Write-Host "Step 5: Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force
Write-Host "Temp directory removed" -ForegroundColor Green

# Step 6: Summary
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            Scaffolding Complete!                  ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - Entities: $modelDir" -ForegroundColor Gray
Write-Host "  - DbContext: $dbContextPath" -ForegroundColor Gray
Write-Host "  - Configurations: $configDir" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review generated entities in Core project" -ForegroundColor Gray
Write-Host "  2. Move Fluent API configurations from DbContext to IEntityTypeConfiguration files" -ForegroundColor Gray
Write-Host "  3. Register DbContext in API project Program.cs" -ForegroundColor Gray
Write-Host "  4. Add project reference: Core -> no dependencies, Infrastructure -> Core" -ForegroundColor Gray
Write-Host ""
Write-Host "Done!" -ForegroundColor Green