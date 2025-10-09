# Getting Started with TheButler API

## 🚀 Quick Start

### 1. Configure Supabase

Update `src/TheButler.Api/appsettings.Development.json` with your Supabase credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Supabase": {
    "Url": "https://cwvkrkiejntyexfxzxpx.supabase.co",
    "AnonKey": "YOUR_ANON_KEY",
    "JwtSecret": "YOUR_JWT_SECRET"
  }
}
```

**Get your credentials from**: [Supabase Dashboard](https://app.supabase.com) → Settings → API

### 2. Run the API

```bash
cd src/TheButler.Api
dotnet run
```

The API will start on:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

### 3. Test Endpoints

#### Public Endpoint (No Auth Required)
```bash
curl http://localhost:5000/api/authtest/public
```

#### Protected Endpoint (Requires Auth)
```bash
# First get a token from Supabase (via your Angular app or Supabase dashboard)
curl -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN" \
     http://localhost:5000/api/authtest/protected
```

## 🏗️ Project Structure

```
TheButlerApi/
├── src/
│   ├── TheButler.Api/              # Web API Layer
│   │   ├── Controllers/            # API endpoints
│   │   ├── Program.cs             # App configuration
│   │   └── appsettings.json       # Configuration
│   │
│   ├── TheButler.Core/            # Domain Layer
│   │   └── Domain/
│   │       ├── Model/             # Entity models
│   │       └── Interfaces/        # Domain interfaces
│   │
│   └── TheButler.Infrastructure/  # Infrastructure Layer
│       ├── Data/                  # DbContext
│       ├── DataAccess/
│       │   ├── Configurations/    # EF Core configurations
│       │   └── Impl/              # Repository implementations
│       └── Services/              # Infrastructure services
│
├── tests/
│   └── TheButler.Tests/           # NUnit tests
│
└── TheButler/database/            # Database scripts
```

## 📦 Key Technologies

- **.NET 9.0** - Latest .NET framework
- **Entity Framework Core 9.0** - ORM for database access
- **PostgreSQL** (via Supabase) - Database
- **Supabase Auth** - Authentication
- **JWT Bearer** - Token-based authentication
- **Swagger/OpenAPI** - API documentation
- **NUnit + Moq** - Testing framework

## 🔐 Authentication Flow

1. **User signs in via Angular app** using Supabase Auth
2. **Supabase returns JWT token**
3. **Angular sends token** in `Authorization: Bearer {token}` header
4. **API validates token** using JWT secret from Supabase
5. **API returns protected data**

## 🧪 Running Tests

```bash
# Run all tests
dotnet test

# Run with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run specific test project
dotnet test tests/TheButler.Tests/TheButler.Tests.csproj
```

## 🗃️ Database Management

### Scaffold New Entities from Database

```powershell
cd C:\Users\deric\source\repos\StudioXConsulting\Projects\TheButler\database
.\scaffold-clean-architecture.ps1
```

This will:
1. Generate entity models from Supabase database
2. Create EF Core configurations
3. Organize files according to Clean Architecture

### Apply Migrations

```bash
cd src/TheButler.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```

## 📚 API Endpoints

### Authentication Test Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/authtest/public` | ❌ | Public test endpoint |
| GET | `/api/authtest/protected` | ✅ | Protected test endpoint |
| GET | `/api/authtest/me` | ✅ | Get current user info |

### Weather Forecast (Example)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/weatherforecast` | ❌ | Get weather forecast |

## 🔧 Development Workflow

### 1. Add New Entity

1. Add table to Supabase database
2. Run scaffold script to generate models
3. Create repository interface in `Core/Domain/Interfaces`
4. Implement repository in `Infrastructure/DataAccess/Impl`
5. Create controller in `Api/Controllers`

### 2. Add New API Endpoint

```csharp
[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : ControllerBase
{
    private readonly TheButlerDbContext _context;
    
    public HouseholdsController(TheButlerDbContext context)
    {
        _context = context;
    }
    
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetHouseholds()
    {
        var userId = User.FindFirst("sub")?.Value;
        
        var households = await _context.HouseholdMembers
            .Where(hm => hm.UserId == Guid.Parse(userId))
            .Include(hm => hm.Household)
            .ToListAsync();
        
        return Ok(households);
    }
}
```

### 3. Add Unit Tests

```csharp
[TestFixture]
public class HouseholdsControllerTests
{
    private TheButlerDbContext _context;
    private HouseholdsController _controller;
    
    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<TheButlerDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        
        _context = new TheButlerDbContext(options);
        _controller = new HouseholdsController(_context);
    }
    
    [Test]
    public async Task GetHouseholds_Should_Return_Ok()
    {
        // Arrange
        // Act
        var result = await _controller.GetHouseholds();
        
        // Assert
        result.Should().BeOfType<OkObjectResult>();
    }
    
    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }
}
```

## 🚨 Troubleshooting

### API won't start

1. Check if port 5000/5001 is already in use
2. Verify Supabase credentials in `appsettings.json`
3. Ensure database is accessible

### "401 Unauthorized" errors

1. Verify token is sent: `Authorization: Bearer {token}`
2. Check token hasn't expired
3. Confirm JWT Secret in appsettings matches Supabase
4. Ensure token is from Supabase Auth

### Database connection errors

1. Check connection string in appsettings
2. Verify Supabase database is running
3. Confirm firewall allows connection
4. Test connection with pgAdmin

### Build errors

```bash
# Clean and rebuild
dotnet clean
dotnet build

# Restore packages
dotnet restore
```

## 📖 Additional Documentation

- [SUPABASE-AUTH-SETUP.md](SUPABASE-AUTH-SETUP.md) - Detailed auth setup
- [TheButler/database/README.md](../TheButler/database/README.md) - Database documentation
- [TheButler/database/CLEAN-ARCHITECTURE-SETUP.md](../TheButler/database/CLEAN-ARCHITECTURE-SETUP.md) - Architecture guide

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com)
- [.NET Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Swagger UI](https://localhost:5001/swagger) (when API is running)

---

**Last Updated**: 2025-10-09  
**Version**: 1.0

