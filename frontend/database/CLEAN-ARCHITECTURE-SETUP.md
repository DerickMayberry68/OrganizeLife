# TheButler - Clean Architecture Setup Guide

## 🏗️ Overview

This guide shows you how to scaffold your Supabase database into a Clean Architecture / Onion Architecture .NET solution.

**Project Structure:**
```
TheButler.sln
├── TheButler.Core/              (Domain layer - no dependencies)
│   └── Domain/
│       └── Model/               ← 32 Entity classes
│           ├── Household.cs
│           ├── Bill.cs
│           ├── Account.cs
│           └── ... (29 more)
│
├── TheButler.Infrastructure/    (Data access layer - depends on Core)
│   ├── Data/
│   │   └── TheButlerDbContext.cs  ← DbContext
│   └── DataAccess/
│       └── Config/              ← IEntityTypeConfiguration files
│           ├── HouseholdConfiguration.cs
│           ├── BillConfiguration.cs
│           └── ... (30 more)
│
└── TheButler.API/               (Presentation layer - depends on Infrastructure)
    ├── Controllers/
    ├── Program.cs
    └── appsettings.json
```

---

## 🚀 Quick Start

### Step 1: Run Scaffolding Script

```powershell
cd database

.\scaffold-clean-architecture.ps1 -ConnectionString "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
```

**What this does:**
1. ✅ Scaffolds database to Infrastructure/Temp
2. ✅ Moves entities to Core/Domain/Model
3. ✅ Generates empty IEntityTypeConfiguration files
4. ✅ Updates DbContext with ApplyConfigurationsFromAssembly
5. ✅ Cleans up temp files

### Step 2: Extract Configurations

```powershell
.\extract-configurations.ps1
```

**What this does:**
1. ✅ Extracts Fluent API from DbContext's OnModelCreating
2. ✅ Moves each entity's configuration to its IEntityTypeConfiguration file
3. ✅ Cleans up DbContext to only call ApplyConfigurationsFromAssembly

### Step 3: Set Up Project References

```bash
# Infrastructure depends on Core
cd ../TheButlerApi/TheButler.Infrastructure
dotnet add reference ../TheButler.Core/TheButler.Core.csproj

# API depends on Infrastructure (which transitively includes Core)
cd ../TheButler.API
dotnet add reference ../TheButler.Infrastructure/TheButler.Infrastructure.csproj
```

### Step 4: Configure API

Update `TheButler.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Supabase": {
    "Url": "https://cwvkrkiejntyexfxzxpx.supabase.co",
    "AnonKey": "YOUR_ANON_KEY",
    "ServiceKey": "YOUR_SERVICE_ROLE_KEY"
  }
}
```

Update `TheButler.API/Program.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<TheButlerDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.MigrationsAssembly("TheButler.Infrastructure")
    ));

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

### Step 5: Test

```bash
cd TheButler.API
dotnet build
dotnet run
```

Navigate to `https://localhost:5001/swagger` and test!

---

## 📋 Manual Setup (If Scripts Don't Work)

### Prerequisites

```bash
# Install EF Core tools globally
dotnet tool install --global dotnet-ef --version 9.0.4

# Install packages in Infrastructure project
cd TheButler.Infrastructure
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.4
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.4
```

### Manual Scaffolding

```bash
cd TheButler.Infrastructure

# Scaffold to Temp folder
dotnet ef dbcontext scaffold "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true" Npgsql.EntityFrameworkCore.PostgreSQL --startup-project ../TheButler.API --output-dir Temp --context-dir Data --context TheButlerDbContext --schema public --no-onconfiguring --force --no-pluralize
```

### Move Files Manually

**1. Move entities to Core:**
- Cut all `.cs` files from `Infrastructure/Temp/`
- Paste into `Core/Domain/Model/`
- Update namespace in each file:
  ```csharp
  namespace TheButler.Core.Domain.Model;
  ```

**2. Update DbContext:**
- File: `Infrastructure/Data/TheButlerDbContext.cs`
- Add using: `using TheButler.Core.Domain.Model;`
- Update DbSet references to use correct namespace

**3. Create Configuration Files:**
- For each entity, create `[EntityName]Configuration.cs` in `Infrastructure/DataAccess/Config/`
- Use this template:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Config;

public class HouseholdConfiguration : IEntityTypeConfiguration<Household>
{
    public void Configure(EntityTypeBuilder<Household> builder)
    {
        builder.ToTable("households");
        
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        // Copy remaining configuration from DbContext OnModelCreating
    }
}
```

**4. Update DbContext OnModelCreating:**

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    // Apply all IEntityTypeConfiguration implementations
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(TheButlerDbContext).Assembly);
    
    OnModelCreatingPartial(modelBuilder);
}

partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
```

---

## 🎨 Example Entity Structure

### Core/Domain/Model/Household.cs

```csharp
namespace TheButler.Core.Domain.Model;

public partial class Household
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = "USA";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Navigation properties
    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
    public virtual ICollection<Bill> Bills { get; set; } = new List<Bill>();
    public virtual ICollection<HouseholdMember> HouseholdMembers { get; set; } = new List<HouseholdMember>();
    public virtual ICollection<HouseholdSetting> HouseholdSettings { get; set; } = new List<HouseholdSetting>();
}
```

### Infrastructure/DataAccess/Config/HouseholdConfiguration.cs

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Config;

public class HouseholdConfiguration : IEntityTypeConfiguration<Household>
{
    public void Configure(EntityTypeBuilder<Household> builder)
    {
        builder.ToTable("households");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()");

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.AddressLine1)
            .HasMaxLength(255);

        builder.Property(e => e.AddressLine2)
            .HasMaxLength(255);

        builder.Property(e => e.City)
            .HasMaxLength(100);

        builder.Property(e => e.State)
            .HasMaxLength(50);

        builder.Property(e => e.PostalCode)
            .HasMaxLength(20);

        builder.Property(e => e.Country)
            .HasMaxLength(100)
            .HasDefaultValue("USA");

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("now()");

        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()");

        // Relationships
        builder.HasMany(h => h.Accounts)
            .WithOne(a => a.Household)
            .HasForeignKey(a => a.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(h => h.Bills)
            .WithOne(b => b.Household)
            .HasForeignKey(b => b.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(h => h.HouseholdMembers)
            .WithOne(m => m.Household)
            .HasForeignKey(m => m.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(h => h.HouseholdSettings)
            .WithOne(s => s.Household)
            .HasForeignKey(s => s.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### Infrastructure/Data/TheButlerDbContext.cs

```csharp
using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.Data;

public partial class TheButlerDbContext : DbContext
{
    public TheButlerDbContext(DbContextOptions<TheButlerDbContext> options)
        : base(options)
    {
    }

    // DbSets (32 tables)
    public virtual DbSet<Household> Households { get; set; }
    public virtual DbSet<HouseholdMember> HouseholdMembers { get; set; }
    public virtual DbSet<HouseholdSetting> HouseholdSettings { get; set; }
    public virtual DbSet<Account> Accounts { get; set; }
    public virtual DbSet<Transaction> Transactions { get; set; }
    public virtual DbSet<Bill> Bills { get; set; }
    public virtual DbSet<PaymentHistory> PaymentHistories { get; set; }
    public virtual DbSet<MaintenanceTask> MaintenanceTasks { get; set; }
    public virtual DbSet<ServiceProvider> ServiceProviders { get; set; }
    public virtual DbSet<InventoryItem> InventoryItems { get; set; }
    public virtual DbSet<Warranty> Warranties { get; set; }
    public virtual DbSet<ItemMaintenanceSchedule> ItemMaintenanceSchedules { get; set; }
    public virtual DbSet<Document> Documents { get; set; }
    public virtual DbSet<DocumentTag> DocumentTags { get; set; }
    public virtual DbSet<InsurancePolicy> InsurancePolicies { get; set; }
    public virtual DbSet<InsuranceBeneficiary> InsuranceBeneficiaries { get; set; }
    public virtual DbSet<Budget> Budgets { get; set; }
    public virtual DbSet<BudgetPeriod> BudgetPeriods { get; set; }
    public virtual DbSet<FinancialGoal> FinancialGoals { get; set; }
    public virtual DbSet<Subscription> Subscriptions { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Reminder> Reminders { get; set; }
    public virtual DbSet<ActivityLog> ActivityLogs { get; set; }
    public virtual DbSet<Category> Categories { get; set; }
    public virtual DbSet<Frequency> Frequencies { get; set; }
    public virtual DbSet<Priority> Priorities { get; set; }
    public virtual DbSet<InsuranceType> InsuranceTypes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all IEntityTypeConfiguration implementations from this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TheButlerDbContext).Assembly);
        
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
```

---

## 🧪 Testing Your Setup

### Create Test Controller

```csharp
// TheButler.API/Controllers/TestController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;

namespace TheButler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public TestController(TheButlerDbContext context)
    {
        _context = context;
    }

    [HttpGet("health")]
    public async Task<IActionResult> HealthCheck()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            
            if (!canConnect)
                return StatusCode(500, "Cannot connect to database");

            var counts = new
            {
                Households = await _context.Households.CountAsync(),
                Categories = await _context.Categories.CountAsync(),
                Frequencies = await _context.Frequencies.CountAsync(),
                Priorities = await _context.Priorities.CountAsync(),
                InsuranceTypes = await _context.InsuranceTypes.CountAsync()
            };

            return Ok(new
            {
                Status = "Healthy",
                Database = "Connected",
                Tables = counts
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = ex.Message });
        }
    }
}
```

**Test:**
```
GET https://localhost:5001/api/test/health
```

Expected response:
```json
{
  "status": "Healthy",
  "database": "Connected",
  "tables": {
    "households": 0,
    "categories": 50,
    "frequencies": 7,
    "priorities": 4,
    "insuranceTypes": 4
  }
}
```

---

## 🔄 Re-scaffolding

When your database schema changes:

```powershell
# Re-run scaffolding script
cd database
.\scaffold-clean-architecture.ps1 -ConnectionString "Host=...;Database=..."

# Re-extract configurations
.\extract-configurations.ps1
```

**Note:** This will overwrite your entity files. If you've added custom logic:
- Use partial classes in a separate file (e.g., `Household.Custom.cs`)
- Or make backups before re-scaffolding

---

## 📚 Benefits of This Architecture

### 1. Separation of Concerns
- ✅ Domain models have no dependencies
- ✅ Data access logic is isolated
- ✅ Easy to test

### 2. Maintainability
- ✅ Each entity's configuration in its own file
- ✅ DbContext is clean and simple
- ✅ Easy to find and modify mappings

### 3. Testability
- ✅ Core can be tested without database
- ✅ Infrastructure can be mocked
- ✅ API controllers are lightweight

### 4. Flexibility
- ✅ Can swap data access implementations
- ✅ Can add multiple DbContexts
- ✅ Easy to add new entities

---

## 🛠️ Troubleshooting

### Issue: "Type 'Household' is defined in an assembly that is not referenced"

**Solution:** Add project reference:
```bash
cd TheButler.Infrastructure
dotnet add reference ../TheButler.Core/TheButler.Core.csproj
```

### Issue: "Cannot find ApplyConfigurationsFromAssembly"

**Solution:** Ensure you're using EF Core 9.0.4:
```bash
dotnet list package
```

### Issue: Scripts fail with permission error

**Solution:** Run PowerShell as Administrator or:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Issue: Connection string error

**Solution:** Ensure connection string includes:
- `SSL Mode=Require`
- `Trust Server Certificate=true`

---

## ✅ Checklist

- [ ] Ran `scaffold-clean-architecture.ps1`
- [ ] Ran `extract-configurations.ps1`
- [ ] Added project references (Infrastructure → Core, API → Infrastructure)
- [ ] Configured connection string in `appsettings.json`
- [ ] Registered DbContext in `Program.cs`
- [ ] Built solution successfully
- [ ] Tested with health check endpoint
- [ ] All 32 entities in Core project
- [ ] All 32 configuration files in Infrastructure project
- [ ] DbContext uses `ApplyConfigurationsFromAssembly`

---

**Your clean architecture is ready!** 🎩✨

Next step: Build your API endpoints and business logic!

