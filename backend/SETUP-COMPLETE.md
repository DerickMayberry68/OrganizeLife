# 🎉 TheButler API - Supabase Authentication Setup Complete!

## ✅ What's Been Configured

### 1. **Supabase Authentication** 
- ✅ JWT Bearer authentication configured
- ✅ Token validation service implemented
- ✅ `SupabaseAuthService` for user info extraction
- ✅ CORS configured for Angular app (`localhost:4200`)
- ✅ Swagger UI with Bearer token support

### 2. **Project Structure**
- ✅ Clean Architecture (Core, Infrastructure, API layers)
- ✅ Entity models scaffolded from Supabase database
- ✅ EF Core configurations in separate files
- ✅ Repository pattern interfaces

### 3. **Testing Framework**
- ✅ NUnit test project created
- ✅ Moq and FluentAssertions installed
- ✅ Sample tests for Core and Infrastructure layers
- ✅ In-memory database for testing

### 4. **API Endpoints**
- ✅ `AuthTestController` with public and protected endpoints
- ✅ `/api/authtest/public` - Test public access
- ✅ `/api/authtest/protected` - Test authenticated access
- ✅ `/api/authtest/me` - Get current user from token

## 🔑 Next Steps: Configure Your Supabase Credentials

### Find Your Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `cwvkrkiejntyexfxzxpx`
3. Navigate to **Settings** → **API**
4. Copy these values:

```json
{
  "Supabase": {
    "Url": "https://cwvkrkiejntyexfxzxpx.supabase.co",
    "AnonKey": "eyJhbG... (starts with eyJ)",
    "JwtSecret": "your-jwt-secret-here (from JWT Settings)"
  }
}
```

### Update Configuration

**Option 1: Development Only** (Recommended)

Create/update `src/TheButler.Api/appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=Remington680102;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Supabase": {
    "Url": "https://cwvkrkiejntyexfxzxpx.supabase.co",
    "AnonKey": "YOUR_ANON_KEY_HERE",
    "JwtSecret": "YOUR_JWT_SECRET_HERE"
  }
}
```

**Option 2: User Secrets** (Most Secure)

```bash
cd src/TheButler.Api
dotnet user-secrets init
dotnet user-secrets set "Supabase:AnonKey" "YOUR_ANON_KEY"
dotnet user-secrets set "Supabase:JwtSecret" "YOUR_JWT_SECRET"
```

## 🚀 Start the API

```bash
cd src/TheButler.Api
dotnet run
```

The API will be available at:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:5001
- **Swagger**: https://localhost:5001/swagger

## 🧪 Test Authentication

### 1. Test Public Endpoint (No Auth)

```bash
curl http://localhost:5000/api/authtest/public
```

**Expected Response:**
```json
{
  "message": "This is a public endpoint - no authentication required",
  "timestamp": "2025-10-09T..."
}
```

### 2. Get Supabase Token (Angular App)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cwvkrkiejntyexfxzxpx.supabase.co',
  'YOUR_ANON_KEY'
)

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

const token = data.session?.access_token
```

### 3. Test Protected Endpoint

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:5000/api/authtest/protected
```

**Expected Response:**
```json
{
  "message": "You are authenticated!",
  "userId": "uuid-here",
  "email": "user@example.com",
  "role": "authenticated",
  "claims": [...]
}
```

### 4. Test in Swagger UI

1. Open https://localhost:5001/swagger
2. Click **Authorize** button (🔒 icon at top right)
3. Enter: `Bearer YOUR_TOKEN`
4. Click **Authorize**
5. Try the `/api/authtest/protected` endpoint

## 📦 Files Created/Modified

### New Files
- `src/TheButler.Core/Domain/Model/ApplicationUser.cs` - User model from JWT
- `src/TheButler.Infrastructure/Services/SupabaseAuthService.cs` - Auth service
- `src/TheButler.Api/Controllers/AuthTestController.cs` - Test endpoints
- `tests/TheButler.Tests/` - Test project with NUnit/Moq
- `SUPABASE-AUTH-SETUP.md` - Detailed auth documentation
- `GETTING-STARTED.md` - Developer guide
- `SETUP-COMPLETE.md` - This file

### Modified Files
- `src/TheButler.Api/Program.cs` - Added JWT authentication, CORS, Swagger auth
- `src/TheButler.Api/appsettings.json` - Added Supabase configuration placeholders
- `src/TheButler.Api/TheButler.Api.csproj` - Added authentication packages

## 🔧 What You Can Do Now

### 1. Create Protected Controllers

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetMyHouseholds()
    {
        var userId = User.FindFirst("sub")?.Value;
        // Your logic here
    }
}
```

### 2. Access User Info

```csharp
[Authorize]
[HttpGet]
public IActionResult GetSomething()
{
    var userId = User.FindFirst("sub")?.Value;      // Supabase user ID
    var email = User.FindFirst("email")?.Value;     // User email
    var role = User.FindFirst("role")?.Value;       // User role
    
    // Use in your queries
    var userHouseholds = _context.HouseholdMembers
        .Where(h => h.UserId == Guid.Parse(userId))
        .ToList();
}
```

### 3. Set Up Angular Authentication

```typescript
// auth.service.ts
import { createClient } from '@supabase/supabase-js'

export class AuthService {
  private supabase = createClient(
    'https://cwvkrkiejntyexfxzxpx.supabase.co',
    'YOUR_ANON_KEY'
  )
  
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (data.session) {
      localStorage.setItem('token', data.session.access_token)
    }
    
    return { data, error }
  }
  
  getToken(): string | null {
    return localStorage.getItem('token')
  }
}

// http.interceptor.ts
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authService.getToken()
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    }
    
    return next.handle(req)
  }
}
```

## 📚 Documentation

- **[SUPABASE-AUTH-SETUP.md](SUPABASE-AUTH-SETUP.md)** - Complete authentication guide
- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Developer quickstart
- **[TheButler/database/README.md](../TheButler/database/README.md)** - Database setup

## 🎯 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Angular App                          │
│  - Login with Supabase Auth                             │
│  - Store JWT token                                       │
│  - Send token in Authorization header                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Bearer Token
                 ▼
┌─────────────────────────────────────────────────────────┐
│               .NET API (TheButler.Api)                   │
│  - Validate JWT token                                    │
│  - Extract user claims                                   │
│  - Return protected data                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Query
                 ▼
┌─────────────────────────────────────────────────────────┐
│          Supabase PostgreSQL Database                    │
│  - Households, Bills, Documents, etc.                    │
│  - Auth tables (managed by Supabase)                     │
└─────────────────────────────────────────────────────────┘
```

## ✨ Summary

Your API is now fully configured with:
- ✅ **Supabase Authentication** - JWT token validation
- ✅ **Clean Architecture** - Proper separation of concerns
- ✅ **Entity Framework Core** - Database access with Fluent API
- ✅ **Repository Pattern** - Abstraction for data access
- ✅ **Swagger UI** - Interactive API documentation
- ✅ **NUnit Testing** - Unit tests with Moq
- ✅ **CORS** - Configured for Angular app

**All you need now is to add your Supabase credentials!** 🔑

---

**Setup Date**: 2025-10-09  
**Status**: ✅ Complete - Ready for Development

