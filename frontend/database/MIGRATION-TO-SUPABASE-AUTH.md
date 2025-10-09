# Migration to Supabase Auth

## 📋 Overview

TheButler database schema has been updated to use **Supabase Auth** instead of **ASP.NET Core Identity** for authentication.

**Date**: 2025-01-09  
**Status**: ✅ Complete

---

## 🔄 What Changed

### Database Schema Changes

**Before (ASP.NET Core Identity):**
```sql
-- 7 Identity tables in public schema
public.AspNetUsers
public.AspNetRoles
public.AspNetUserRoles
public.AspNetUserClaims
public.AspNetUserLogins
public.AspNetUserTokens
public.AspNetRoleClaims

-- Foreign keys pointing to AspNetUsers
household_members.user_id → AspNetUsers.Id
notifications.user_id → AspNetUsers.Id
activity_logs.user_id → AspNetUsers.Id
```

**After (Supabase Auth):**
```sql
-- Use Supabase's auth schema (automatic)
auth.users              -- Created by Supabase
auth.refresh_tokens
auth.sessions
auth.identities
auth.audit_log_entries

-- Foreign keys pointing to auth.users
household_members.user_id → auth.users.id
notifications.user_id → auth.users.id
activity_logs.user_id → auth.users.id
```

### Key Differences

| Aspect | ASP.NET Core Identity | Supabase Auth |
|--------|----------------------|---------------|
| **Schema** | `public` | `auth` (separate) |
| **Tables Count** | 7 tables (you create) | 5+ tables (automatic) |
| **User Table** | `AspNetUsers` | `auth.users` |
| **ID Type** | UUID | UUID (same!) |
| **Installation** | Run `identity-schema.sql` | Nothing (auto-created) |
| **Foreign Keys** | To `public.AspNetUsers` | To `auth.users` |

---

## 📦 Files Modified

### 1. schema.sql
**Changes:**
- Updated header comment: "Supabase Auth Integration"
- Changed foreign key references from `AspNetUsers` to `auth.users`
- Added explicit foreign key constraints with `ON DELETE CASCADE`

**Tables affected:**
- `household_members` - user_id now references auth.users(id)
- `notifications` - user_id now references auth.users(id)
- `activity_logs` - user_id now references auth.users(id)
- All `created_by`/`updated_by` comments updated

### 2. install.bat
**Changes:**
- Removed Step 2 (ASP.NET Core Identity installation)
- Changed from 5 steps to 4 steps
- Updated step numbers and descriptions
- Removed Identity table counting in verification
- Updated "Next steps" to reference Supabase guides

### 3. install.sh
**Changes:**
- Same changes as install.bat for Linux/Mac
- Removed Identity installation step
- Updated verification logic
- Changed next steps messaging

---

## 🚀 Installation Instructions

### For New Installations (Supabase)

**Simple Installation:**
```bash
cd database

# Set Supabase password
set PGPASSWORD=your_supabase_password

# Run installation (no identity-schema.sql needed!)
install.bat --db-host db.yourproject.supabase.co --db-user postgres --db-name postgres
```

**Manual Installation:**
```bash
# 1. Create database (or use existing 'postgres' database in Supabase)
# 2. Run schema
psql -h db.yourproject.supabase.co -U postgres -d postgres -f schema.sql

# 3. Run seed data
psql -h db.yourproject.supabase.co -U postgres -d postgres -f seed-data.sql

# 4. Disable RLS (important!)
psql -h db.yourproject.supabase.co -U postgres -d postgres -f disable-rls.sql
```

### For Existing Local Installations

If you already have a local database with ASP.NET Core Identity tables:

**Option 1: Keep It (Recommended)**
- ✅ Your local database is fine for testing
- ✅ Deploy fresh to Supabase with new schema
- ✅ No migration needed

**Option 2: Migrate Local Database**
```sql
-- 1. Drop Identity tables
DROP TABLE IF EXISTS "AspNetUserTokens" CASCADE;
DROP TABLE IF EXISTS "AspNetUserRoles" CASCADE;
DROP TABLE IF EXISTS "AspNetUserLogins" CASCADE;
DROP TABLE IF EXISTS "AspNetUserClaims" CASCADE;
DROP TABLE IF EXISTS "AspNetRoleClaims" CASCADE;
DROP TABLE IF EXISTS "AspNetRoles" CASCADE;
DROP TABLE IF EXISTS "AspNetUsers" CASCADE;

-- 2. Drop tables that referenced AspNetUsers
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS household_members CASCADE;

-- 3. Recreate with new schema
-- Note: auth.users won't exist locally, so you'd need to mock it or skip for local dev
```

**Recommendation:** Keep local as-is, deploy fresh to Supabase.

---

## 🔐 Supabase Auth Setup

### Step 1: Disable Row Level Security

⚠️ **Important:** Supabase enables RLS by default. Since your .NET API handles authorization, disable RLS:

```sql
-- Run this in Supabase SQL Editor after schema installation
ALTER TABLE households DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE household_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE warranties DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_maintenance_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE frequencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE priorities DISABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_types DISABLE ROW LEVEL SECURITY;
```

### Step 2: Configure Supabase Auth in Dashboard

1. Go to **Authentication** → **Settings**
2. Enable auth providers you want:
   - ✅ Email/Password
   - ✅ Google OAuth
   - ✅ GitHub OAuth
   - ✅ Magic Links
3. Configure email templates (optional)
4. Set Site URL (your Angular app URL)

### Step 3: Get Supabase Keys

1. Go to **Settings** → **API**
2. Copy:
   - `anon` / `public` key (for client apps)
   - `service_role` key (for .NET API - keep secret!)

---

## 💻 .NET API Changes

### Install NuGet Packages

```bash
dotnet add package supabase-csharp
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

### Configure appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require"
  },
  "Supabase": {
    "Url": "https://yourproject.supabase.co",
    "ServiceKey": "YOUR_SERVICE_ROLE_KEY"
  }
}
```

### Validate Supabase JWT Tokens

```csharp
// Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://yourproject.supabase.co/auth/v1";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "https://yourproject.supabase.co/auth/v1",
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ValidateLifetime = true
        };
    });
```

### Access User ID in Controllers

```csharp
[Authorize]
[ApiController]
[Route("api/households")]
public class HouseholdsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMyHouseholds()
    {
        // Get user ID from Supabase JWT token
        var userId = User.FindFirst("sub")?.Value; // This is auth.users.id
        
        var households = await _db.HouseholdMembers
            .Where(m => m.UserId == Guid.Parse(userId))
            .Include(m => m.Household)
            .Select(m => m.Household)
            .ToListAsync();
        
        return Ok(households);
    }
}
```

---

## 🌐 Angular App Changes

### Install Supabase

```bash
npm install @supabase/supabase-js
```

### Configure Supabase Client

```typescript
// src/app/services/supabase.service.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://yourproject.supabase.co',
      'your-anon-key'
    );
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  getSession() {
    return this.supabase.auth.getSession();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }
}
```

### Make API Calls with Token

```typescript
// src/app/services/household.service.ts
export class HouseholdService {
  constructor(
    private http: HttpClient,
    private supabase: SupabaseService
  ) {}

  async getHouseholds() {
    // Get Supabase session
    const { data: { session } } = await this.supabase.getSession();
    
    // Call your .NET API with token
    return this.http.get('https://your-api.com/api/households', {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    }).toPromise();
  }
}
```

---

## 📊 Database Verification

After installation, verify everything is correct:

```sql
-- 1. Check table count
SELECT COUNT(*) as table_count 
FROM pg_tables 
WHERE schemaname = 'public';
-- Expected: 32 tables

-- 2. Check foreign key to auth.users
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
  AND ccu.table_schema = 'auth';
-- Expected: household_members, notifications, activity_logs

-- 3. Verify Supabase auth tables exist
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'auth'
ORDER BY tablename;
-- Expected: audit_log_entries, identities, refresh_tokens, sessions, users, etc.
```

---

## 🎯 Migration Checklist

### For New Supabase Deployments
- [ ] Create Supabase project
- [ ] Note connection details (host, password)
- [ ] Run `install.bat` with Supabase parameters
- [ ] Disable RLS on all tables
- [ ] Configure Supabase Auth in dashboard
- [ ] Copy anon and service_role keys
- [ ] Update .NET API configuration
- [ ] Update Angular app with Supabase client
- [ ] Test registration and login
- [ ] Test API endpoints with JWT tokens

### For Existing Local Databases
- [ ] Keep local database as-is (recommended)
- [ ] Deploy fresh to Supabase
- [ ] Test both environments work
- [ ] Update Angular to use Supabase Auth
- [ ] Update .NET API to validate Supabase tokens

---

## 🔧 Troubleshooting

### Issue: Foreign key constraint error

```
ERROR: relation "auth.users" does not exist
```

**Cause:** Running schema.sql on local PostgreSQL without Supabase.

**Solutions:**
1. Deploy to Supabase (auth schema exists automatically)
2. For local dev, create mock auth schema:
```sql
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL
);
```

### Issue: RLS blocking queries

```
ERROR: new row violates row-level security policy
```

**Solution:** Disable RLS (see Step 1 above)

### Issue: JWT validation failing

**Check:**
1. Supabase URL is correct in .NET config
2. Token is being sent in Authorization header
3. Token hasn't expired (check expiry in JWT)
4. Audience is set to "authenticated"

---

## 📚 Additional Resources

- **[SUPABASE-GUIDE.md](SUPABASE-GUIDE.md)** - Complete Supabase setup guide
- **[DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md)** - .NET API integration
- **[schema.sql](schema.sql)** - Updated database schema
- **[Supabase Auth Docs](https://supabase.com/docs/guides/auth)** - Official documentation

---

## ✅ Summary

**What You Gained:**
- ✅ Zero backend auth code to write
- ✅ Built-in OAuth providers (Google, GitHub, etc.)
- ✅ Magic links and SMS auth
- ✅ User management dashboard
- ✅ Automatic session management

**What You Kept:**
- ✅ All your business logic in .NET API
- ✅ Household member roles (Admin/Member)
- ✅ Complex permissions and validation
- ✅ Same database structure (32 tables)
- ✅ Full control over application layer

**Migration Status:** ✅ Complete and ready for deployment!

---

**Questions?** Review the guides above or check the inline SQL comments in schema.sql.

🎩 **TheButler + Supabase Auth = Perfect Match!**

