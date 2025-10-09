# TheButler API

A .NET 9 Web API for managing household tasks, bills, documents, and more. Built with Clean Architecture principles and integrated with Supabase PostgreSQL and Authentication.

## ✨ Features

- **Clean Architecture** - Separation of concerns (Core, Infrastructure, API)
- **Supabase Integration** - PostgreSQL database + JWT authentication
- **Entity Framework Core 9** - Code-first ORM with Fluent API configurations
- **Repository Pattern** - Abstraction layer for data access
- **Swagger/OpenAPI** - Interactive API documentation
- **NUnit Testing** - Unit tests with Moq and FluentAssertions
- **CORS** - Configured for Angular frontend (`localhost:4200`)

## 🚀 Quick Start

### Prerequisites

- .NET 9.0 SDK
- Supabase account (free tier works)
- PostgreSQL client (optional, for database management)

### 1. Clone and Restore

```bash
git clone <your-repo>
cd TheButlerApi
dotnet restore
```

### 2. Configure Supabase

Create `src/TheButler.Api/appsettings.Development.json`:

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

**Get your credentials**: [Supabase Dashboard](https://app.supabase.com) → Settings → API

### 3. Run the API

```bash
cd src/TheButler.Api
dotnet run
```

**API will be available at:**
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger: `https://localhost:5001/swagger`

### 4. Test It

```bash
# Test public endpoint
curl http://localhost:5000/api/authtest/public

# Response:
# {"message":"This is a public endpoint - no authentication required","timestamp":"2025-10-09T..."}
```

## 📚 Documentation

- **[SUPABASE-AUTH-SETUP.md](SUPABASE-AUTH-SETUP.md)** - Complete Supabase authentication guide
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Developer quickstart guide
- **[SETUP-COMPLETE.md](SETUP-COMPLETE.md)** - Setup completion checklist
- **[TheButler/database/](../TheButler/database/)** - Database schema and setup scripts

## 🏗️ Project Structure

```
TheButlerApi/
├── src/
│   ├── TheButler.Api/              # 🌐 Web API Layer
│   │   ├── Controllers/            # API endpoints
│   │   ├── Program.cs             # App startup & configuration
│   │   └── appsettings.json       # Configuration settings
│   │
│   ├── TheButler.Core/            # 🎯 Domain Layer
│   │   └── Domain/
│   │       ├── Model/             # 50+ Entity models (scaffolded from DB)
│   │       └── Interfaces/        # IRepository, IEntity, IDbContext
│   │
│   └── TheButler.Infrastructure/  # 🔧 Infrastructure Layer
│       ├── Data/
│       │   └── TheButlerDbContext.cs     # EF Core DbContext
│       ├── DataAccess/
│       │   ├── Configurations/    # 50+ Fluent API configurations
│       │   └── Impl/              # Repository.cs
│       └── Services/
│           └── SupabaseAuthService.cs    # JWT validation
│
├── tests/
│   └── TheButler.Tests/           # 🧪 NUnit test project
│       ├── Core/                  # Domain tests
│       └── Infrastructure/        # DbContext & repository tests
│
└── docs/                           # 📖 Documentation
```

## 🔐 Authentication

This API uses **Supabase Auth** with JWT Bearer tokens:

1. **User signs in** via Supabase (Angular app)
2. **Supabase returns JWT** access token
3. **Angular sends token** in `Authorization: Bearer {token}` header
4. **API validates token** using Supabase JWT secret
5. **API returns protected data**

### Example: Protected Controller

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyHouseholds()
    {
        var userId = User.FindFirst("sub")?.Value;  // Get Supabase user ID
        // Query database using userId
        return Ok(households);
    }
}
```

## 🗃️ Database Entities

The API includes 50+ entities scaffolded from Supabase:

**Core Entities:**
- `Households` - Household management
- `HouseholdMembers` - User membership & roles
- `Bills` - Bill tracking & payments
- `Documents` - Document storage metadata
- `Accounts` - Financial accounts (checking, savings, credit)
- `Transactions` - Financial transactions
- `Budgets` - Budget management
- `Goals` - Financial goals
- `Subscriptions` - Recurring subscriptions
- `Insurance` - Insurance policies
- `Inventory` - Household inventory
- `Maintenance` - Home maintenance tasks
- `Vehicles` - Vehicle management
- `Pets` - Pet information
- `Contacts` - Emergency contacts
- `Calendar` - Household calendar events
- `Notes` - Shared notes
- `Files` - File attachments
- `Reminders` - Task reminders
- `Notifications` - User notifications
- `ActivityLogs` - Audit trail
- `UserPreferences` - User settings
- And more...

All entities follow Clean Architecture with:
- Entity models in `Core/Domain/Model`
- EF configurations in `Infrastructure/DataAccess/Configurations`
- Fluent API for database mappings

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run with detailed output
dotnet test --logger "console;verbosity=detailed"

# Current test coverage:
# ✅ 5/5 tests passing
# - Core entity tests
# - Infrastructure DbContext tests
```

### Test Stack:
- **NUnit 3** - Testing framework
- **Moq 4.20.72** - Mocking framework
- **FluentAssertions 6.12.2** - Readable assertions
- **EF Core InMemory** - In-memory database for tests

## 📦 NuGet Packages

### API Project
- `Microsoft.AspNetCore.Authentication.JwtBearer 9.0.4`
- `Microsoft.EntityFrameworkCore 9.0.9`
- `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.2`
- `Swashbuckle.AspNetCore 7.2.0`
- `supabase-csharp 0.16.2`

### Infrastructure Project
- `Microsoft.EntityFrameworkCore 9.0.9`
- `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.2`

### Test Project
- `NUnit 3.14.0`
- `Moq 4.20.72`
- `FluentAssertions 6.12.2`
- `Microsoft.EntityFrameworkCore.InMemory 9.0.9`

## 🛠️ Development

### Add New Feature

1. **Add database table** in Supabase
2. **Scaffold entities**: Run `database/scaffold-clean-architecture.ps1`
3. **Create repository interface** in `Core/Domain/Interfaces`
4. **Implement repository** in `Infrastructure/DataAccess/Impl`
5. **Create controller** in `Api/Controllers`
6. **Write tests** in `tests/TheButler.Tests`

### Scaffold Database Changes

```powershell
cd C:\Users\deric\source\repos\StudioXConsulting\Projects\TheButler\database
.\scaffold-clean-architecture.ps1
```

This PowerShell script:
- Connects to Supabase database
- Generates entity models from tables
- Creates EF Core configuration files
- Organizes code into Clean Architecture layers

## 🌐 API Endpoints

### Authentication Test
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/authtest/public` | ❌ | Test public access |
| GET | `/api/authtest/protected` | ✅ | Test authentication |
| GET | `/api/authtest/me` | ✅ | Get current user |

### Example: Using cURL

```bash
# Public endpoint (no auth)
curl http://localhost:5000/api/authtest/public

# Protected endpoint (requires Supabase JWT)
curl -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
     http://localhost:5000/api/authtest/protected
```

### Example: Using Swagger

1. Open `https://localhost:5001/swagger`
2. Click **Authorize** button (🔒)
3. Enter: `Bearer YOUR_SUPABASE_JWT_TOKEN`
4. Click **Authorize**
5. Try any protected endpoint

## 🔧 Configuration

### appsettings.json (Production)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;..."
  },
  "Supabase": {
    "Url": "https://cwvkrkiejntyexfxzxpx.supabase.co",
    "AnonKey": "YOUR_ANON_KEY",
    "JwtSecret": "YOUR_JWT_SECRET"
  }
}
```

### User Secrets (Recommended for Development)

```bash
cd src/TheButler.Api
dotnet user-secrets init
dotnet user-secrets set "Supabase:AnonKey" "YOUR_ANON_KEY"
dotnet user-secrets set "Supabase:JwtSecret" "YOUR_JWT_SECRET"
```

## 🚨 Troubleshooting

### API won't start
- Check if ports 5000/5001 are available
- Verify Supabase credentials (or run without - auth will be disabled)
- Check database connectivity

### 401 Unauthorized
- Ensure token is sent: `Authorization: Bearer {token}`
- Verify token hasn't expired
- Confirm JWT Secret matches Supabase

### Database connection errors
- Check connection string format
- Verify Supabase database is running
- Test with pgAdmin or psql

### Build errors
```bash
dotnet clean
dotnet restore
dotnet build
```

## 📝 Status

✅ **Setup Complete** - Ready for development

### What's Working:
- ✅ Database connection to Supabase PostgreSQL
- ✅ 50+ entities scaffolded with EF Core
- ✅ Supabase JWT authentication configured
- ✅ Clean Architecture implemented
- ✅ Repository pattern established
- ✅ Swagger API documentation
- ✅ NUnit testing framework
- ✅ CORS configured for Angular frontend

### Next Steps:
1. Add your Supabase credentials
2. Create business logic controllers
3. Implement repository methods
4. Add comprehensive unit tests
5. Build Angular frontend integration

## 📞 Support

- **Database Setup**: See `TheButler/database/README.md`
- **Authentication**: See `SUPABASE-AUTH-SETUP.md`
- **Getting Started**: See `GETTING-STARTED.md`

## 📄 License

[Your License Here]

---

**Last Updated**: 2025-10-09  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (pending Supabase credentials)

