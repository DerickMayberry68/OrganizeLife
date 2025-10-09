# =====================================================
# TheButler - Extract EF Configurations
# =====================================================
# This script extracts Fluent API configurations from
# DbContext and moves them to IEntityTypeConfiguration files
# =====================================================

param(
    [string]$SolutionRoot = "C:\Users\deric\source\repos\TheButlerApi",
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Usage: .\extract-configurations.ps1 [-SolutionRoot "path"]

This script extracts entity configurations from TheButlerDbContext.OnModelCreating
and moves them to individual IEntityTypeConfiguration<T> files.

Parameters:
  -SolutionRoot  Optional. Path to your solution root
  -Help          Show this help message

Example:
  .\extract-configurations.ps1
"@
    exit 0
}

# Define paths
$infraProject = Join-Path $SolutionRoot "src\TheButler.Infrastructure"
$dbContextPath = Join-Path $infraProject "Data\TheButlerDbContext.cs"
$configDir = Join-Path $infraProject "DataAccess\Config"

if (!(Test-Path $dbContextPath)) {
    Write-Host "ERROR: DbContext not found at: $dbContextPath" -ForegroundColor Red
    exit 1
}

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   TheButler - Extract Configurations              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Read DbContext
$dbContextContent = Get-Content $dbContextPath -Raw

Write-Host "Extracting configurations from DbContext..." -ForegroundColor Yellow
Write-Host ""

# Extract OnModelCreating content
if ($dbContextContent -match "protected override void OnModelCreating\(ModelBuilder modelBuilder\)\s*\{([\s\S]*?)\n\s*\}") {
    $onModelCreatingBody = $Matches[1]
    
    # Parse entity configurations
    $entityBlocks = [regex]::Matches($onModelCreatingBody, "modelBuilder\.Entity<(\w+)>\(entity =>\s*\{([\s\S]*?)\n\s*\}\);")
    
    $extractedCount = 0
    
    foreach ($block in $entityBlocks) {
        $entityName = $block.Groups[1].Value
        $configuration = $block.Groups[2].Value.Trim()
        
        $configFileName = "$($entityName)Configuration.cs"
        $configPath = Join-Path $configDir $configFileName
        
        if (Test-Path $configPath) {
            # Read existing config file
            $configContent = Get-Content $configPath -Raw
            
            # Replace the Configure method body
            $replacement = "public void Configure(EntityTypeBuilder<$entityName> builder)`n"
            $replacement += "    {`n"
            $replacement += "$configuration`n"
            $replacement += "    }`n"
            $newConfigContent = $configContent -replace "public void Configure\(EntityTypeBuilder<$entityName> builder\)\s*\{[\s\S]*?\n\s*\}", $replacement
            
            # Update the file
            Set-Content -Path $configPath -Value $newConfigContent
            
            Write-Host "  Updated $configFileName" -ForegroundColor Gray
            $extractedCount++
        }
    }
    
    Write-Host ""
    Write-Host "Extracted $extractedCount configurations" -ForegroundColor Green
    Write-Host ""
    
    # Now clean up DbContext - remove individual entity configurations, keep only ApplyConfigurationsFromAssembly
    $cleanedOnModelCreating = "protected override void OnModelCreating(ModelBuilder modelBuilder)`n"
    $cleanedOnModelCreating += "    {`n"
    $cleanedOnModelCreating += "        // Apply all IEntityTypeConfiguration implementations from this assembly`n"
    $cleanedOnModelCreating += "        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TheButlerDbContext).Assembly);`n"
    $cleanedOnModelCreating += "        `n"
    $cleanedOnModelCreating += "        OnModelCreatingPartial(modelBuilder);`n"
    $cleanedOnModelCreating += "    }`n"
    $cleanedOnModelCreating += "`n"
    $cleanedOnModelCreating += "    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);"
    
    # Replace OnModelCreating method
    $dbContextContent = $dbContextContent -replace "protected override void OnModelCreating\(ModelBuilder modelBuilder\)[\s\S]*?\n\s*\}", $cleanedOnModelCreating
    
    # Save updated DbContext
    Set-Content -Path $dbContextPath -Value $dbContextContent
    
    Write-Host "DbContext cleaned up" -ForegroundColor Green
}
else {
    Write-Host "WARNING: Could not find OnModelCreating method" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            Configuration Extraction Complete!     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review configuration files in: $configDir" -ForegroundColor Gray
Write-Host "  2. Review cleaned DbContext in: $dbContextPath" -ForegroundColor Gray
Write-Host "  3. Build solution to verify everything compiles" -ForegroundColor Gray
Write-Host ""
Write-Host "Done!" -ForegroundColor Green

