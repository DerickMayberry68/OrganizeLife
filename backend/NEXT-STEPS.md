# 🎉 Supabase Authentication - Next Steps

## ✅ What's Complete

Your API is now **fully configured** with Supabase authentication:

- ✅ Supabase credentials configured in `appsettings.json`
- ✅ JWT Bearer authentication enabled
- ✅ API running on `http://localhost:5000`
- ✅ Swagger UI available at `http://localhost:5000/swagger`
- ✅ Public and protected endpoints working

## 🧪 How to Test Authentication

### 1. **Test Without Token (Public Endpoint)**

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

### 2. **Test Without Token (Protected Endpoint)**

```bash
curl http://localhost:5000/api/authtest/protected
```

**Expected Response:**
```
401 Unauthorized
```
This confirms authentication is working! 🎉

### 3. **Get a Supabase Token**

You need to sign up/sign in a user to get a JWT token. You have 3 options:

#### **Option A: Use Supabase Dashboard (Quickest)**

1. Go to [Supabase Dashboard](https://app.supabase.com/project/cwvkrkiejntyexfxzxpx)
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter email and password
5. Go to **SQL Editor** and run:
   ```sql
   SELECT auth.sign_in_with_password('your-email@example.com', 'your-password');
   ```
6. This will return a JSON with `access_token` - copy it!

#### **Option B: Use cURL to Sign Up**

```bash
curl -X POST "https://cwvkrkiejntyexfxzxpx.supabase.co/auth/v1/signup" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmtya2llam50eWV4Znh6eHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Nzc5NDksImV4cCI6MjA3NTU1Mzk0OX0.mTYN5JRhJDrs1XUblMnUJzVVp0rUR-j9mKiX62b-Kbs" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

**Response will include:**
```json
{
  "access_token": "eyJhbGc...",
  "user": { ... }
}
```

#### **Option C: Use Your Angular App**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cwvkrkiejntyexfxzxpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'Test123456!'
})

// Sign in
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'Test123456!'
})

console.log('Access Token:', session?.access_token)
```

### 4. **Test With Token (Protected Endpoint)**

Once you have a token:

```bash
# Replace YOUR_TOKEN with actual token from step 3
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/authtest/protected
```

**Expected Response:**
```json
{
  "message": "You are authenticated!",
  "userId": "uuid-here",
  "email": "test@example.com",
  "role": "authenticated",
  "claims": [...]
}
```

### 5. **Test in Swagger UI**

1. Open `http://localhost:5000/swagger`
2. Click the **🔒 Authorize** button (top right)
3. Enter: `Bearer YOUR_TOKEN` (include the word "Bearer")
4. Click **Authorize**
5. Try the `/api/authtest/protected` endpoint - it should work!

## 🚀 Next: Build Your API Endpoints

Now that authentication is working, create your business logic endpoints:

### Example: Households Controller

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public HouseholdsController(TheButlerDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all households for the current user
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyHouseholds()
    {
        // Get user ID from JWT token
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            return Unauthorized(new { Message = "Invalid token" });
        }

        var userId = Guid.Parse(userIdClaim);

        // Query households where user is a member
        var households = await _context.HouseholdMembers
            .Where(hm => hm.UserId == userId && hm.IsActive)
            .Include(hm => hm.Household)
            .Select(hm => new
            {
                hm.Household.Id,
                hm.Household.Name,
                hm.Role,
                MemberCount = hm.Household.HouseholdMembers.Count(m => m.IsActive),
                hm.JoinedAt
            })
            .ToListAsync();

        return Ok(households);
    }

    /// <summary>
    /// Create a new household
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateHousehold([FromBody] CreateHouseholdDto dto)
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        var userId = Guid.Parse(userIdClaim);

        var household = new Households
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = userId,
            IsActive = true
        };

        _context.Households.Add(household);

        // Add creator as admin member
        var member = new HouseholdMembers
        {
            Id = Guid.NewGuid(),
            HouseholdId = household.Id,
            UserId = userId,
            Role = "Admin",
            JoinedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.HouseholdMembers.Add(member);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMyHouseholds), new { id = household.Id }, household);
    }
}

public record CreateHouseholdDto(string Name);
```

### Add DTOs for Request/Response

Create `src/TheButler.Api/DTOs/HouseholdDtos.cs`:

```csharp
namespace TheButler.Api.DTOs;

public record CreateHouseholdDto(
    string Name
);

public record HouseholdResponseDto(
    Guid Id,
    string Name,
    string Role,
    int MemberCount,
    DateTime JoinedAt
);

public record InviteMemberDto(
    string Email,
    string Role
);
```

## 📋 Recommended Controller Endpoints

Here are the key endpoints you'll likely need:

### **Households**
- `GET /api/households` - Get user's households
- `POST /api/households` - Create household
- `GET /api/households/{id}` - Get household details
- `PUT /api/households/{id}` - Update household
- `DELETE /api/households/{id}` - Delete household
- `POST /api/households/{id}/members` - Invite member
- `DELETE /api/households/{id}/members/{userId}` - Remove member

### **Bills**
- `GET /api/households/{id}/bills` - Get household bills
- `POST /api/households/{id}/bills` - Create bill
- `PUT /api/bills/{id}` - Update bill
- `POST /api/bills/{id}/pay` - Mark bill as paid
- `DELETE /api/bills/{id}` - Delete bill

### **Documents**
- `GET /api/households/{id}/documents` - Get documents
- `POST /api/households/{id}/documents` - Upload document
- `GET /api/documents/{id}/download` - Download document
- `DELETE /api/documents/{id}` - Delete document

### **Accounts (Financial)**
- `GET /api/households/{id}/accounts` - Get accounts
- `POST /api/households/{id}/accounts` - Add account
- `GET /api/accounts/{id}/transactions` - Get transactions

### **Budget**
- `GET /api/households/{id}/budgets` - Get budgets
- `POST /api/households/{id}/budgets` - Create budget
- `GET /api/budgets/{id}/spending` - Get spending vs budget

## 🔐 Authorization Best Practices

### 1. **Always Verify Household Membership**

```csharp
private async Task<bool> IsUserMemberOfHousehold(Guid userId, Guid householdId)
{
    return await _context.HouseholdMembers
        .AnyAsync(hm => hm.HouseholdId == householdId 
                     && hm.UserId == userId 
                     && hm.IsActive);
}

[HttpGet("{id}")]
public async Task<IActionResult> GetHousehold(Guid id)
{
    var userId = Guid.Parse(User.FindFirst("sub").Value);
    
    if (!await IsUserMemberOfHousehold(userId, id))
    {
        return Forbid(); // 403 Forbidden
    }
    
    // Return household data
}
```

### 2. **Check Admin Role for Sensitive Operations**

```csharp
private async Task<bool> IsUserHouseholdAdmin(Guid userId, Guid householdId)
{
    return await _context.HouseholdMembers
        .AnyAsync(hm => hm.HouseholdId == householdId 
                     && hm.UserId == userId 
                     && hm.Role == "Admin"
                     && hm.IsActive);
}

[HttpDelete("{id}")]
public async Task<IActionResult> DeleteHousehold(Guid id)
{
    var userId = Guid.Parse(User.FindFirst("sub").Value);
    
    if (!await IsUserHouseholdAdmin(userId, id))
    {
        return Forbid(); // Only admins can delete
    }
    
    // Delete household
}
```

### 3. **Create a Base Controller**

```csharp
public abstract class AuthorizedControllerBase : ControllerBase
{
    protected readonly TheButlerDbContext _context;

    protected AuthorizedControllerBase(TheButlerDbContext context)
    {
        _context = context;
    }

    protected Guid CurrentUserId => Guid.Parse(User.FindFirst("sub")?.Value 
        ?? throw new UnauthorizedAccessException());

    protected async Task<bool> IsUserMemberOfHousehold(Guid householdId)
    {
        return await _context.HouseholdMembers
            .AnyAsync(hm => hm.HouseholdId == householdId 
                         && hm.UserId == CurrentUserId 
                         && hm.IsActive);
    }

    protected async Task<bool> IsUserHouseholdAdmin(Guid householdId)
    {
        return await _context.HouseholdMembers
            .AnyAsync(hm => hm.HouseholdId == householdId 
                         && hm.UserId == CurrentUserId 
                         && hm.Role == "Admin"
                         && hm.IsActive);
    }
}
```

Then use it:

```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HouseholdsController : AuthorizedControllerBase
{
    public HouseholdsController(TheButlerDbContext context) : base(context)
    {
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetHousehold(Guid id)
    {
        if (!await IsUserMemberOfHousehold(id))
        {
            return Forbid();
        }
        
        // CurrentUserId is available from base class
        var household = await _context.Households.FindAsync(id);
        return Ok(household);
    }
}
```

## 📝 Summary

**You're all set!** 🎉

✅ **Authentication is working**
✅ **API is running on** `http://localhost:5000`
✅ **Swagger UI available at** `http://localhost:5000/swagger`

**Next:**
1. Get a Supabase JWT token (see options above)
2. Test protected endpoints with token
3. Start building your business logic controllers
4. Integrate with your Angular frontend

Need help? Check:
- `SUPABASE-AUTH-SETUP.md` - Detailed auth documentation
- `GETTING-STARTED.md` - Developer guide
- `README.md` - Project overview

---

**Happy Coding!** 🚀

