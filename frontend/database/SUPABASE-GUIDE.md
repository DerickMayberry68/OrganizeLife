# TheButler + Supabase Quick Start Guide

## 🎯 Overview

This guide shows you how to deploy TheButler database to Supabase and integrate it with your .NET Web API.

**Key Points:**

- ✅ Use Supabase as PostgreSQL provider only
- ✅ Keep ASP.NET Core Identity for authentication
- ✅ Use Supabase Storage for documents/photos
- ✅ Optional: Use Supabase Realtime for live updates

---

## 📋 Prerequisites

- [ ] Supabase account (free tier is fine)
- [ ] PostgreSQL client installed (`psql` command)
- [ ] TheButler database scripts ready

---

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign Up / Log In

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in with GitHub (recommended)
3. Click **"New Project"**

### 1.2 Project Settings

- **Name**: `TheButler` (or your preference)
- **Database Password**: Generate a strong password (save it!)
- **Region**: Choose closest to you (e.g., `us-east-1`)
- **Pricing Plan**: Free tier is perfect for development

### 1.3 Wait for Provisioning

- Takes about 2 minutes
- You'll see "Setting up project..." message
- When ready, you'll see the project dashboard

---

## 🔌 Step 2: Get Connection Details

### 2.1 Navigate to Database Settings

1. Click **"Database"** in left sidebar (or Settings icon)
2. Scroll to **"Connection info"** section

### 2.2 Copy Connection Details

**You'll see:**

- **Host**: `db.yourproject.supabase.co`
- **Database name**: `postgres` (default, can't change)
- **Port**: `5432`
- **User**: `postgres`
- **Password**: The one you set during project creation

**Connection String format:**

```text
postgresql://postgres:[YOUR-PASSWORD]@db.yourproject.supabase.co:5432/postgres
```

### 2.3 Important: Use "Direct Connection"

Supabase has two connection modes:

- **Transaction Mode** (pooled) - Port 6543 - For serverless/edge functions
- **Session Mode** (direct) - Port 5432 - For your .NET API ✅

**Use Port 5432** for your .NET API!

---

## 💾 Step 3: Install Database Schema

### Option 1: Using install.bat (Recommended)

```cmd
cd database

REM Set your Supabase password
set PGPASSWORD=your_supabase_password

REM Run installation
install.bat --db-host db.yourproject.supabase.co --db-user postgres --db-name postgres --db-port 5432
```

Replace:

- `your_supabase_password` with your actual password
- `db.yourproject.supabase.co` with your actual host

### Option 2: Using Supabase SQL Editor (GUI)

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Copy contents of `identity-schema.sql`
4. Paste into editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Repeat for `schema.sql`
7. Repeat for `seed-data.sql`

### Option 3: Using psql Command Line

```bash
cd database

# Set password as environment variable
set PGPASSWORD=your_supabase_password

# Install schemas
psql -h db.yourproject.supabase.co -p 5432 -U postgres -d postgres -f identity-schema.sql
psql -h db.yourproject.supabase.co -p 5432 -U postgres -d postgres -f schema.sql
psql -h db.yourproject.supabase.co -p 5432 -U postgres -d postgres -f seed-data.sql
```

---

## ✅ Step 4: Verify Installation

### 4.1 Using Supabase Table Editor

1. Click **"Table Editor"** in left sidebar
2. You should see **39 tables** in the dropdown
3. Look for:
   - `AspNetUsers`, `AspNetRoles`, etc. (Identity tables)
   - `households`, `accounts`, `bills`, etc. (TheButler tables)

### 4.2 Using SQL Editor

Run this verification query:

```sql
-- Count tables
SELECT COUNT(*) as total_tables 
FROM pg_tables 
WHERE schemaname = 'public';
-- Should return: 39

-- List Identity tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'AspNet%'
ORDER BY tablename;
-- Should show 7 tables

-- Check seed data
SELECT COUNT(*) as category_count FROM categories;
-- Should return: 50+
```

---

## 🔐 Step 5: Configure .NET Connection String

### 5.1 Get Connection String from Supabase

In Supabase Dashboard → Settings → Database → Connection String:

**For .NET (Npgsql):**

```text
Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD]
```

### 5.2 Add to appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=your_password;SSL Mode=Require;Trust Server Certificate=true"
  }
}
```

### 5.3 Production Best Practice

**For Development (appsettings.Development.json):**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=dev_password;SSL Mode=Require"
  }
}
```

**For Production (Environment Variables):**

```bash
# Set as environment variable in Azure/Render/Railway
DATABASE_URL=Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=prod_password;SSL Mode=Require
```

---

## 🔒 Step 6: Supabase Security Settings

### 6.1 Disable Row Level Security (RLS)

⚠️ **Important**: Supabase enables RLS by default on all tables. Since you're using ASP.NET Core Identity for authentication, you need to **disable RLS** on your tables.

**Run this in SQL Editor:**

```sql
-- Disable RLS on all TheButler tables
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

-- Disable RLS on Identity tables
ALTER TABLE "AspNetUsers" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AspNetRoles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AspNetUserRoles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AspNetUserClaims" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AspNetUserLogins" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AspNetUserTokens" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "AspNetRoleClaims" DISABLE ROW LEVEL SECURITY;
```

**Why?**

- Supabase RLS is designed for client-side apps
- Your .NET API handles all authorization
- RLS would block your API's database access

### 6.2 API Settings

**Disable Supabase Auth (Optional but Recommended):**

1. Go to Settings → API
2. You can keep the API enabled (it won't interfere)
3. Just don't use `@supabase/supabase-js` auth methods

---

## 📦 Step 7: Set Up Supabase Storage (Optional)

Supabase Storage is perfect for documents and photos!

### 7.1 Create Storage Buckets

In Supabase Dashboard → Storage:

1. **Create "documents" bucket**
   - Name: `documents`
   - Public: ❌ (private)
   - Allowed MIME types: `application/pdf,image/*,application/msword,etc.`

2. **Create "photos" bucket**
   - Name: `photos`
   - Public: ❌ (private)
   - Allowed MIME types: `image/jpeg,image/png,image/webp`

### 7.2 Storage Policies

Since you're using ASP.NET Core Identity, you'll manage file uploads via your .NET API:

**Disable Storage Policies:**

```sql
-- Remove default storage policies (your API will handle auth)
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files" ON storage.objects;
```

### 7.3 Upload Files from .NET

Install Supabase .NET SDK:

```bash
dotnet add package supabase-csharp
```

**Upload Example:**

```csharp
using Supabase.Storage;

public class StorageService
{
    private readonly Supabase.Client _supabase;

    public StorageService(IConfiguration config)
    {
        var url = "https://yourproject.supabase.co";
        var key = config["Supabase:ServiceKey"];
        _supabase = new Supabase.Client(url, key);
    }

    public async Task<string> UploadDocument(string householdId, IFormFile file)
    {
        var fileName = $"{householdId}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        
        using var stream = file.OpenReadStream();
        var bytes = new byte[stream.Length];
        await stream.ReadAsync(bytes, 0, (int)stream.Length);

        await _supabase.Storage
            .From("documents")
            .Upload(bytes, fileName);

        return fileName; // Store this in your documents.file_path column
    }

    public async Task<byte[]> DownloadDocument(string filePath)
    {
        return await _supabase.Storage
            .From("documents")
            .Download(filePath);
    }
}
```

---

## 📊 Step 8: Supabase Dashboard Features

### 8.1 Table Editor

- View and edit data directly
- Great for testing
- Click any table to see/edit rows

### 8.2 SQL Editor

- Write custom queries
- Save frequently used queries
- Run migrations

### 8.3 Database → Backups

- Automatic daily backups (free tier: last 7 days)
- Manual backups via SQL Editor:

  ```sql
  -- Use pg_dump via CLI instead
  ```

### 8.4 Logs & Monitoring

- Settings → Logs
- View query performance
- Monitor connections
- Check errors

### 8.5 API Documentation

- Settings → API
- Auto-generated API docs (won't use with .NET)
- Connection strings
- API keys

---

## 🔄 Step 9: Local Dev + Supabase Cloud Workflow

### Recommended Workflow

**Local Development:**

```bash
# Use local PostgreSQL for dev
createdb thebutler_local
psql -d thebutler_local -f identity-schema.sql
psql -d thebutler_local -f schema.sql
psql -d thebutler_local -f seed-data.sql
```

**appsettings.Development.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=thebutler_local;Username=postgres;Password=local"
  }
}
```

**Cloud Deployment (Supabase):**

```bash
# Deploy to Supabase
install.bat --db-host db.yourproject.supabase.co --db-user postgres --db-name postgres
```

**appsettings.Production.json:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=prod_password;SSL Mode=Require"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "relation does not exist" with Identity tables

**Problem**: PostgreSQL is case-sensitive with quoted identifiers.

**Solution**: Always use quotes in queries:

```csharp
// In your DbContext
protected override void OnModelCreating(ModelBuilder builder)
{
    builder.Entity<IdentityUser>().ToTable("AspNetUsers");
    // EF Core will handle quoting
}
```

### Issue: RLS blocking queries

**Symptoms**: Empty results or "new row violates row-level security policy"

**Solution**: Disable RLS (see Step 6.1)

### Issue: Connection timeout

**Problem**: Supabase pauses database after inactivity (free tier)

**Solution**:

- First query after pause may be slow (cold start)
- Upgrade to paid tier for always-on database
- Or implement connection retry logic

### Issue: SSL connection required

**Solution**: Add `SSL Mode=Require` to connection string:

```text
Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=pass;SSL Mode=Require;Trust Server Certificate=true
```

---

## 💡 Supabase-Specific Tips

### 1. Database Size Limits

- **Free tier**: 500 MB
- **Pro tier**: 8 GB (upgradable)
- Monitor in Dashboard → Settings → Database

### 2. Connection Limits

- **Free tier**: 60 simultaneous connections
- Use connection pooling in .NET (built into Npgsql)
- Configure in `DbContext`:

  ```csharp
  optionsBuilder.UseNpgsql(connectionString, 
      options => options.MaxPoolSize(20));
  ```

### 3. Backup Strategy

- Free tier: 7 days of automated backups
- Manual backups:

  ```bash
  pg_dump -h db.yourproject.supabase.co -U postgres -d postgres > backup.sql
  ```

### 4. Extensions

Supabase includes many PostgreSQL extensions:

- ✅ `uuid-ossp` (already enabled)
- ✅ `pg_stat_statements` (query performance)
- Available: `postgis`, `pg_cron`, etc.

Enable extensions in SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

### 5. Real-time Subscriptions (Future Feature)

If you want live updates in Angular app:

```typescript
// Listen to table changes
supabase
  .from('notifications')
  .on('INSERT', payload => {
    console.log('New notification!', payload);
  })
  .subscribe();
```

But this requires Supabase client library in Angular.

---

## 🎯 Recommended Next Steps

1. ✅ Create Supabase project
2. ✅ Run install.bat with Supabase connection details
3. ✅ Disable RLS on all tables
4. ✅ Test connection from .NET
5. ✅ Set up storage buckets for documents/photos
6. ✅ Configure backups
7. ✅ Monitor query performance in dashboard

---

## 📚 Additional Resources

### Supabase Documentation

- [PostgreSQL Connection](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [.NET Client Library](https://github.com/supabase-community/supabase-csharp)

### TheButler Documentation

- [IDENTITY-SETUP.md](IDENTITY-SETUP.md) - ASP.NET Core Identity setup
- [DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md) - .NET API examples
- [ERD.md](ERD.md) - Database schema
- [CLOUD-DEPLOYMENT.md](CLOUD-DEPLOYMENT.md) - General cloud guide

---

## ✅ Supabase Setup Checklist

- [ ] Supabase project created
- [ ] Connection details saved securely
- [ ] Database schema installed (39 tables)
- [ ] RLS disabled on all tables
- [ ] Seed data loaded
- [ ] Connection string in appsettings.json
- [ ] Test query successful
- [ ] Storage buckets created (optional)
- [ ] Backups configured
- [ ] Dashboard bookmarked

---

**Your Connection String Template:**

```text
Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true
```

**Your install.bat Command:**

```cmd
set PGPASSWORD=YOUR_PASSWORD
install.bat --db-host db.yourproject.supabase.co --db-user postgres --db-name postgres
```

---

🎩 **TheButler + Supabase = Perfect Match!**

Supabase gives you PostgreSQL + Storage + Dashboard, while your .NET API handles all the business logic and authentication. Best of both worlds! 🚀
