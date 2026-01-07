# ASP.NET Core Integration Guide

## Getting Started

This guide provides examples for integrating the OrganizeLife PostgreSQL database with ASP.NET Core 8+ Web API.

## 📦 Required NuGet Packages

```xml
<ItemGroup>
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.*" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.*" />
  <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.*" />
</ItemGroup>
```

## 🔧 Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=organizelife;Username=postgres;Password=yourpassword;Include Error Detail=true"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  }
}
```

### Program.cs

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add PostgreSQL with EF Core
builder.Services.AddDbContext<OrganizeLifeDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
    ));

// Add ASP.NET Core Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<OrganizeLifeDbContext>()
.AddDefaultTokenProviders();

// Add Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("HouseholdAdmin", policy =>
        policy.Requirements.Add(new HouseholdRequirement { Role = "Admin" }));
    
    options.AddPolicy("HouseholdMember", policy =>
        policy.Requirements.Add(new HouseholdRequirement { Role = null }));
});

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

## 📝 Entity Examples

### Base Entity

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid UpdatedBy { get; set; }
}

public abstract class SoftDeletableEntity : BaseEntity
{
    public DateTime? DeletedAt { get; set; }
    public bool IsDeleted => DeletedAt.HasValue;
}
```

### Application User

```csharp
public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    
    // Navigation properties
    public ICollection<HouseholdMember> HouseholdMemberships { get; set; } = new List<HouseholdMember>();
}
```

### Core Entities

```csharp
public class Household : SoftDeletableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = "USA";
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<HouseholdMember> Members { get; set; } = new List<HouseholdMember>();
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Bill> Bills { get; set; } = new List<Bill>();
}

public class HouseholdMember : BaseEntity
{
    public Guid HouseholdId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "Member"; // Admin, Member
    public DateTime JoinedAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public Household Household { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
```

### Financial Entities

```csharp
public class Account : SoftDeletableEntity
{
    public Guid HouseholdId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // checking, savings, credit, investment
    public string Institution { get; set; } = string.Empty;
    public string? AccountNumberLast4 { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public bool IsActive { get; set; } = true;
    public DateTime? LastSyncedAt { get; set; }
    public string? PlaidAccountId { get; set; }
    
    // Navigation properties
    public Household Household { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

public class Transaction : SoftDeletableEntity
{
    public Guid HouseholdId { get; set; }
    public Guid AccountId { get; set; }
    public Guid? CategoryId { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty; // income, expense
    public string? MerchantName { get; set; }
    public string? Notes { get; set; }
    public string? PlaidTransactionId { get; set; }
    public bool IsRecurring { get; set; }
    public Guid? ParentTransactionId { get; set; }
    
    // Navigation properties
    public Household Household { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category? Category { get; set; }
}

public class Budget : SoftDeletableEntity
{
    public Guid HouseholdId { get; set; }
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal LimitAmount { get; set; }
    public string Period { get; set; } = string.Empty; // monthly, yearly
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public Household Household { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<BudgetPeriod> BudgetPeriods { get; set; } = new List<BudgetPeriod>();
}
```

## 🗄️ DbContext

```csharp
public class OrganizeLifeDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public OrganizeLifeDbContext(DbContextOptions<OrganizeLifeDbContext> options) : base(options) { }
    
    // Core
    public DbSet<Household> Households { get; set; }
    public DbSet<HouseholdMember> HouseholdMembers { get; set; }
    public DbSet<HouseholdSetting> HouseholdSettings { get; set; }
    
    // Financial
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<BudgetPeriod> BudgetPeriods { get; set; }
    public DbSet<FinancialGoal> FinancialGoals { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    
    // Bills
    public DbSet<Bill> Bills { get; set; }
    public DbSet<PaymentHistory> PaymentHistory { get; set; }
    
    // Maintenance
    public DbSet<ServiceProvider> ServiceProviders { get; set; }
    public DbSet<MaintenanceTask> MaintenanceTasks { get; set; }
    
    // Inventory
    public DbSet<InventoryItem> InventoryItems { get; set; }
    public DbSet<Warranty> Warranties { get; set; }
    public DbSet<ItemMaintenanceSchedule> ItemMaintenanceSchedules { get; set; }
    
    // Documents
    public DbSet<Document> Documents { get; set; }
    
    // Insurance
    public DbSet<InsurancePolicy> InsurancePolicies { get; set; }
    public DbSet<InsuranceBeneficiary> InsuranceBeneficiaries { get; set; }
    
    // System
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Reminder> Reminders { get; set; }
    public DbSet<ActivityLog> ActivityLogs { get; set; }
    
    // Lookup
    public DbSet<Category> Categories { get; set; }
    public DbSet<Frequency> Frequencies { get; set; }
    public DbSet<Priority> Priorities { get; set; }
    public DbSet<InsuranceType> InsuranceTypes { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Configure PostgreSQL table naming (snake_case)
        builder.Entity<Household>().ToTable("households");
        builder.Entity<HouseholdMember>().ToTable("household_members");
        builder.Entity<Account>().ToTable("accounts");
        builder.Entity<Transaction>().ToTable("transactions");
        // ... configure all other tables
        
        // Configure UUID generation
        builder.Entity<Household>()
            .Property(h => h.Id)
            .HasDefaultValueSql("uuid_generate_v4()");
        
        // Configure decimal precision
        builder.Entity<Account>()
            .Property(a => a.Balance)
            .HasPrecision(15, 2);
        
        builder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasPrecision(15, 2);
        
        // Configure unique constraints
        builder.Entity<HouseholdMember>()
            .HasIndex(hm => new { hm.HouseholdId, hm.UserId })
            .IsUnique();
        
        // Configure soft delete global query filter
        builder.Entity<Household>()
            .HasQueryFilter(h => h.DeletedAt == null);
        
        builder.Entity<Transaction>()
            .HasQueryFilter(t => t.DeletedAt == null);
        
        // Configure relationships
        builder.Entity<Transaction>()
            .HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Disable triggers for EF (let PostgreSQL handle them)
        builder.Entity<Transaction>()
            .ToTable(tb => tb.ExcludeFromMigrations());
    }
    
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-set audit fields
        var entries = ChangeTracker.Entries<BaseEntity>();
        var userId = /* Get from HttpContext */;
        
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedBy = userId;
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = userId;
            }
        }
        
        return base.SaveChangesAsync(cancellationToken);
    }
}
```

## 🎯 Repository Pattern

```csharp
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly OrganizeLifeDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(OrganizeLifeDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }
    
    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }
    
    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }
    
    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
    
    public virtual async Task<T> UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
    
    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            if (entity is SoftDeletableEntity softDeletable)
            {
                softDeletable.DeletedAt = DateTime.UtcNow;
                _dbSet.Update(entity);
            }
            else
            {
                _dbSet.Remove(entity);
            }
            await _context.SaveChangesAsync();
        }
    }
}

// Example: TransactionRepository with household scoping
public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IEnumerable<Transaction>> GetByHouseholdAsync(Guid householdId);
    Task<IEnumerable<Transaction>> GetByAccountAsync(Guid accountId);
    Task<decimal> GetTotalByCategory(Guid householdId, Guid categoryId, DateTime startDate, DateTime endDate);
}

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    public TransactionRepository(OrganizeLifeDbContext context) : base(context) { }
    
    public async Task<IEnumerable<Transaction>> GetByHouseholdAsync(Guid householdId)
    {
        return await _dbSet
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.HouseholdId == householdId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Transaction>> GetByAccountAsync(Guid accountId)
    {
        return await _dbSet
            .Include(t => t.Category)
            .Where(t => t.AccountId == accountId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }
    
    public async Task<decimal> GetTotalByCategory(
        Guid householdId, 
        Guid categoryId, 
        DateTime startDate, 
        DateTime endDate)
    {
        return await _dbSet
            .Where(t => t.HouseholdId == householdId 
                && t.CategoryId == categoryId
                && t.Date >= startDate
                && t.Date <= endDate
                && t.Type == "expense")
            .SumAsync(t => t.Amount);
    }
}
```

## 🔐 Authorization

```csharp
public class HouseholdRequirement : IAuthorizationRequirement
{
    public string? Role { get; set; }
}

public class HouseholdAuthorizationHandler : AuthorizationHandler<HouseholdRequirement, Guid>
{
    private readonly OrganizeLifeDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HouseholdAuthorizationHandler(
        OrganizeLifeDbContext context,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HouseholdRequirement requirement,
        Guid householdId)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return;
        }
        
        var membership = await _context.HouseholdMembers
            .FirstOrDefaultAsync(m => 
                m.HouseholdId == householdId && 
                m.UserId == userId &&
                m.IsActive);
        
        if (membership == null)
        {
            return;
        }
        
        if (requirement.Role == null || membership.Role == requirement.Role)
        {
            context.Succeed(requirement);
        }
    }
}
```

## 🎮 Controller Example

```csharp
[ApiController]
[Route("api/households/{householdId}/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionRepository _transactionRepo;
    private readonly IAuthorizationService _authService;
    
    public TransactionsController(
        ITransactionRepository transactionRepo,
        IAuthorizationService authService)
    {
        _transactionRepo = transactionRepo;
        _authService = authService;
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions(
        [FromRoute] Guid householdId)
    {
        var authResult = await _authService.AuthorizeAsync(
            User, householdId, "HouseholdMember");
        
        if (!authResult.Succeeded)
        {
            return Forbid();
        }
        
        var transactions = await _transactionRepo.GetByHouseholdAsync(householdId);
        return Ok(transactions);
    }
    
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(
        [FromRoute] Guid householdId,
        [FromBody] CreateTransactionDto dto)
    {
        var authResult = await _authService.AuthorizeAsync(
            User, householdId, "HouseholdMember");
        
        if (!authResult.Succeeded)
        {
            return Forbid();
        }
        
        var transaction = new Transaction
        {
            HouseholdId = householdId,
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId,
            Date = dto.Date,
            Description = dto.Description,
            Amount = dto.Amount,
            Type = dto.Type
        };
        
        var created = await _transactionRepo.AddAsync(transaction);
        return CreatedAtAction(nameof(GetTransactions), new { householdId }, created);
    }
}
```

## 📊 Activity Logging

```csharp
public interface IActivityLogger
{
    Task LogActivity(Guid householdId, string action, string entityType, Guid entityId, string entityName);
}

public class ActivityLogger : IActivityLogger
{
    private readonly OrganizeLifeDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityLogger(OrganizeLifeDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }
    
    public async Task LogActivity(
        Guid householdId, 
        string action, 
        string entityType, 
        Guid entityId, 
        string entityName)
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return;
        }
        
        var log = new ActivityLog
        {
            HouseholdId = householdId,
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            EntityName = entityName,
            IpAddress = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString(),
            CreatedAt = DateTime.UtcNow
        };
        
        await _context.ActivityLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }
}
```

## ⚠️ Important Notes

1. **Snake Case**: All database objects use `snake_case`. Use column annotations:
   ```csharp
   [Column("created_at")]
   public DateTime CreatedAt { get; set; }
   ```

2. **Triggers**: Don't disable PostgreSQL triggers. Let the database handle balance updates and budget calculations.

3. **Soft Deletes**: Use query filters to automatically exclude soft-deleted records:
   ```csharp
   builder.Entity<Transaction>()
       .HasQueryFilter(t => t.DeletedAt == null);
   ```

4. **Timezone**: Always use `DateTime.UtcNow` for consistency with PostgreSQL `TIMESTAMPTZ`.

5. **Decimal Precision**: Configure precision for money fields:
   ```csharp
   .HasPrecision(15, 2)
   ```

---

**Next Steps:**
1. Run the SQL schema and seed data
2. Create entity classes for all tables
3. Configure DbContext with proper mappings
4. Implement repository pattern
5. Add authorization handlers
6. Create API controllers
7. Test with Swagger/Postman

