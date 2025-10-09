# ASP.NET Core Identity Setup Guide

## Overview

This guide covers setting up ASP.NET Core Identity 8.0 tables for TheButler application using PostgreSQL with UUID primary keys.

## 📋 Files

- **`identity-schema.sql`** - ASP.NET Core Identity tables optimized for PostgreSQL
- **`schema.sql`** - TheButler application tables
- **`seed-data.sql`** - Initial lookup data

## 🚀 Installation Order

### 1. Create Database

```bash
createdb thebutler
```

### 2. Install Identity Tables First

```bash
psql -d thebutler -f database/identity-schema.sql
```

This creates:
- `AspNetUsers` - User accounts
- `AspNetRoles` - Application roles
- `AspNetUserRoles` - User-Role assignments
- `AspNetUserClaims` - User-specific claims
- `AspNetUserLogins` - External authentication providers
- `AspNetUserTokens` - Authentication tokens
- `AspNetRoleClaims` - Role-based claims

### 3. Install TheButler Tables

```bash
psql -d thebutler -f database/schema.sql
```

This creates all household management tables that reference `AspNetUsers`.

### 4. Load Seed Data

```bash
psql -d thebutler -f database/seed-data.sql
```

## 🔑 Key Differences from Standard Identity

### UUID Primary Keys
Instead of `string` or `int`, all IDs are `UUID`:
- More secure (non-sequential)
- Globally unique (good for distributed systems)
- Consistent with TheButler schema

### Custom User Fields
Extended `AspNetUsers` with:
- `FirstName` VARCHAR(100)
- `LastName` VARCHAR(100)
- `ProfilePhotoUrl` VARCHAR(500)
- `CreatedAt` TIMESTAMPTZ
- `UpdatedAt` TIMESTAMPTZ (auto-updated)
- `LastLoginAt` TIMESTAMPTZ

### PostgreSQL Optimized
- PascalCase table/column names (ASP.NET convention)
- TIMESTAMPTZ for timezone awareness
- Proper indexes for performance
- Foreign key constraints

## 👥 Default Roles (Optional)

Uncomment the role seeding section in `identity-schema.sql` to create:

```sql
INSERT INTO "AspNetRoles" ("Id", "Name", "NormalizedName", "ConcurrencyStamp")
VALUES 
    (uuid_generate_v4(), 'SystemAdmin', 'SYSTEMADMIN', uuid_generate_v4()::text),
    (uuid_generate_v4(), 'HouseholdAdmin', 'HOUSEHOLDADMIN', uuid_generate_v4()::text),
    (uuid_generate_v4(), 'HouseholdMember', 'HOUSEHOLDMEMBER', uuid_generate_v4()::text);
```

**Note**: These are application-level roles, separate from household-level roles in the `household_members` table.

## 🔗 Integration with TheButler Schema

### User References

TheButler tables reference `AspNetUsers` via:
- `created_by UUID` - References `AspNetUsers.Id`
- `updated_by UUID` - References `AspNetUsers.Id`
- `user_id UUID` - References `AspNetUsers.Id`

### Household Membership

The `household_members` table links users to households:

```sql
CREATE TABLE household_members (
    id UUID PRIMARY KEY,
    household_id UUID REFERENCES households(id),
    user_id UUID,  -- References AspNetUsers.Id
    role VARCHAR(50),  -- 'Admin', 'Member' (household-level role)
    ...
);
```

### Two-Level Authorization

1. **Application Level** (`AspNetRoles`):
   - SystemAdmin - Full system access
   - HouseholdAdmin - Can manage households
   - HouseholdMember - Can access households

2. **Household Level** (`household_members.role`):
   - Admin - Full access to household data
   - Member - Standard member access

## 🔧 .NET Configuration

### Startup/Program.cs

```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext
builder.Services.AddDbContext<ButlerDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.MigrationsAssembly("TheButler.Api")
    ));

// Configure Identity with UUID
builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 1;

    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ButlerDbContext>()
.AddDefaultTokenProviders();

// Add JWT Authentication (recommended for API)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"])),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
```

### Entity Classes

```csharp
using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation properties
    public ICollection<HouseholdMember> HouseholdMemberships { get; set; } = new List<HouseholdMember>();
}

public class ApplicationRole : IdentityRole<Guid>
{
    public ApplicationRole() : base() { }
    public ApplicationRole(string roleName) : base(roleName) { }
}
```

### DbContext Configuration

```csharp
public class ButlerDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ButlerDbContext(DbContextOptions<ButlerDbContext> options) 
        : base(options) { }
    
    // TheButler tables
    public DbSet<Household> Households { get; set; }
    public DbSet<HouseholdMember> HouseholdMembers { get; set; }
    // ... other tables
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Configure table names (ASP.NET Identity uses PascalCase)
        // No need to change Identity table names - they're already correct
        
        // Configure TheButler tables (snake_case)
        builder.Entity<Household>().ToTable("households");
        builder.Entity<HouseholdMember>().ToTable("household_members");
        // ... configure all other tables
        
        // Configure foreign key to AspNetUsers
        builder.Entity<HouseholdMember>()
            .HasOne<ApplicationUser>()
            .WithMany(u => u.HouseholdMemberships)
            .HasForeignKey(hm => hm.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

## 🔐 Authentication Examples

### Register User

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            EmailConfirmed = false
        };
        
        var result = await _userManager.CreateAsync(user, dto.Password);
        
        if (result.Succeeded)
        {
            // Add to default role
            await _userManager.AddToRoleAsync(user, "HouseholdMember");
            
            // TODO: Send confirmation email
            
            return Ok(new { UserId = user.Id });
        }
        
        return BadRequest(result.Errors);
    }
}
```

### Login and Generate JWT

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login(LoginDto dto)
{
    var user = await _userManager.FindByEmailAsync(dto.Email);
    
    if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
    {
        return Unauthorized("Invalid credentials");
    }
    
    if (!user.EmailConfirmed)
    {
        return Unauthorized("Email not confirmed");
    }
    
    // Update last login
    user.LastLoginAt = DateTime.UtcNow;
    await _userManager.UpdateAsync(user);
    
    // Generate JWT
    var token = await GenerateJwtToken(user);
    
    return Ok(new { Token = token, UserId = user.Id });
}

private async Task<string> GenerateJwtToken(ApplicationUser user)
{
    var roles = await _userManager.GetRolesAsync(user);
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim("firstName", user.FirstName),
        new Claim("lastName", user.LastName)
    };
    
    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
    
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    
    var token = new JwtSecurityToken(
        issuer: _configuration["JwtSettings:Issuer"],
        audience: _configuration["JwtSettings:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddHours(24),
        signingCredentials: creds
    );
    
    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

## 📊 Common Queries

### Get User with Households

```sql
SELECT 
    u."Id",
    u."UserName",
    u."Email",
    u."FirstName",
    u."LastName",
    json_agg(
        json_build_object(
            'householdId', h.id,
            'householdName', h.name,
            'role', hm.role
        )
    ) AS households
FROM "AspNetUsers" u
LEFT JOIN household_members hm ON u."Id" = hm.user_id
LEFT JOIN households h ON hm.household_id = h.id
WHERE u."Id" = 'USER_UUID'
  AND hm.is_active = true
  AND h.deleted_at IS NULL
GROUP BY u."Id";
```

### Get All Users in a Household

```sql
SELECT 
    u."Id",
    u."UserName",
    u."Email",
    u."FirstName",
    u."LastName",
    hm.role,
    hm.joined_at
FROM household_members hm
JOIN "AspNetUsers" u ON hm.user_id = u."Id"
WHERE hm.household_id = 'HOUSEHOLD_UUID'
  AND hm.is_active = true
ORDER BY hm.role, hm.joined_at;
```

## 🔄 Migrations

If you modify the Identity tables, generate migrations:

```bash
dotnet ef migrations add UpdateIdentity --context ButlerDbContext
dotnet ef database update --context ButlerDbContext
```

## 🛠️ Maintenance

### Reset a User Password

```sql
-- This should be done via UserManager in code
-- If you must do it via SQL (not recommended):
UPDATE "AspNetUsers"
SET "PasswordHash" = NULL,
    "SecurityStamp" = uuid_generate_v4()::text
WHERE "Email" = 'user@example.com';
```

### Lock Out a User

```sql
UPDATE "AspNetUsers"
SET "LockoutEnd" = NOW() + INTERVAL '1 hour',
    "LockoutEnabled" = true
WHERE "Email" = 'user@example.com';
```

### Check User Roles

```sql
SELECT 
    u."UserName",
    u."Email",
    r."Name" AS role_name
FROM "AspNetUsers" u
JOIN "AspNetUserRoles" ur ON u."Id" = ur."UserId"
JOIN "AspNetRoles" r ON ur."RoleId" = r."Id"
WHERE u."Email" = 'user@example.com';
```

## 📝 Important Notes

1. **Case Sensitivity**: PostgreSQL is case-sensitive. Identity table/column names use PascalCase and must be quoted.

2. **UUID vs String**: Default Identity uses `string` for IDs. We use `UUID` for better security and consistency.

3. **No Migrations**: These SQL scripts are for initial setup. For ongoing changes, use EF Core migrations.

4. **External Logins**: The `AspNetUserLogins` table supports Google, Microsoft, Facebook, etc. Configure these in your startup.

5. **Two-Factor Auth**: Enable via `TwoFactorEnabled` column and configure providers in code.

## 🔗 Related Documentation

- [schema.sql](schema.sql) - Main TheButler tables
- [DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md) - .NET integration guide
- [README.md](README.md) - Complete database documentation

---

**Version**: 1.0  
**ASP.NET Core Identity**: 8.0  
**PostgreSQL**: 12+  
**Last Updated**: 2025-01-09

