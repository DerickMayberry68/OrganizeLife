# 🔔 Alerts System Setup Guide

## Overview
This guide will help you set up the Alerts/Notifications system for The Butler application, including:
1. Running the database migration
2. Testing the background alert generation service
3. Testing the API endpoints

---

## 📊 Step 1: Run Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Navigate to your project

2. **Open SQL Editor**
   - Click on the **SQL Editor** tab in the left sidebar
   - Click **New Query**

3. **Run the Migration Script**
   - Copy the entire contents of `database-migrations/add-alerts-table.sql`
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

4. **Verify Success**
   - You should see: `"Alerts table migration completed successfully!"`
   - The script will also show:
     - Table creation confirmation
     - Indexes created (7 indexes)
     - RLS policies created (4 policies)

### Option B: Using psql Command Line

```bash
# From the backend directory
psql "Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=Remington680102;SSL Mode=Require" -f database-migrations/add-alerts-table.sql
```

### Verify the Table Was Created

Run this query in Supabase SQL Editor:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'alerts'
ORDER BY ordinal_position;

-- Check row count (should be 0 initially)
SELECT COUNT(*) as alert_count FROM alerts;
```

---

## ⚙️ Step 2: Configure Background Service

The background service is already configured! Here's what was set up:

### Configuration in `appsettings.Development.json`:

```json
{
  "AlertGeneration": {
    "Enabled": true,
    "IntervalMinutes": 60,
    "ApiBaseUrl": "https://localhost:7001"
  }
}
```

### Configuration Options:

- **`Enabled`**: `true` to enable the background service (only runs in Development by default)
- **`IntervalMinutes`**: How often to generate alerts (default: 60 minutes)
  - For testing, you can set this to `5` for alerts every 5 minutes
  - For production, keep at `60` (1 hour) or `1440` (daily)
- **`ApiBaseUrl`**: The base URL of your API
  - Development: `https://localhost:7001` or `http://localhost:5000`
  - Production: Your deployed API URL

### Adjust for Quick Testing:

If you want to test alerts generation more frequently, update `appsettings.Development.json`:

```json
{
  "AlertGeneration": {
    "Enabled": true,
    "IntervalMinutes": 5,  // Run every 5 minutes for testing
    "ApiBaseUrl": "https://localhost:7001"
  }
}
```

---

## 🚀 Step 3: Start the API

1. **Start the API** (if not already running):

```bash
cd src/TheButler.Api
dotnet run
```

2. **Watch for Background Service Messages**:

You should see console output like:

```
✅ Alert Generation Background Service enabled
info: TheButler.Api.Services.AlertGenerationService[0]
      AlertGenerationService initialized with 60 minute interval
info: TheButler.Api.Services.AlertGenerationService[0]
      AlertGenerationService started
```

3. **Wait for First Alert Generation**:

After 30 seconds (initial delay), you'll see:

```
info: TheButler.Api.Services.AlertGenerationService[0]
      Starting alert generation cycle at 10/11/2025 10:30:00 PM
info: TheButler.Api.Services.AlertGenerationService[0]
      Found 2 active households
info: TheButler.Api.Services.AlertGenerationService[0]
      Generated 5 alerts for household abc123...
info: TheButler.Api.Services.AlertGenerationService[0]
      Alert generation summary: 5 alerts generated, 2 households succeeded, 0 households failed
info: TheButler.Api.Services.AlertGenerationService[0]
      Alert generation cycle completed at 10/11/2025 10:30:15 PM
info: TheButler.Api.Services.AlertGenerationService[0]
      Next alert generation cycle in 01:00:00
```

---

## 🧪 Step 4: Test Alert Endpoints

### 1. Open Swagger UI

Navigate to: `https://localhost:7001/swagger`

### 2. Authorize (if authentication is enabled)

- Click **Authorize** button
- Enter: `Bearer YOUR_SUPABASE_JWT_TOKEN`
- Click **Authorize**

### 3. Test Manual Alert Generation

#### Generate All Alerts for a Household

```
POST /api/Alerts/generate/all/{householdId}
```

This will generate alerts for:
- ✅ Bills (due soon, overdue)
- ✅ Maintenance tasks (due soon, overdue)
- ✅ Healthcare appointments (upcoming)
- ✅ Healthcare medications (refills needed)
- ✅ Insurance policies (expiring soon)
- ✅ Documents (expiring soon)
- ⚠️ Inventory (disabled - needs model properties)
- ✅ Budgets (80%, 90%, 100% thresholds)

#### Generate Specific Category

```
POST /api/Alerts/generate/bills/{householdId}
POST /api/Alerts/generate/maintenance/{householdId}
POST /api/Alerts/generate/healthcare/{householdId}
POST /api/Alerts/generate/insurance/{householdId}
POST /api/Alerts/generate/documents/{householdId}
POST /api/Alerts/generate/budget/{householdId}
```

### 4. Test Alert Retrieval

#### Get All Alerts

```
GET /api/Alerts/household/{householdId}
```

#### Get Unread Alerts

```
GET /api/Alerts/household/{householdId}/unread
```

#### Get By Category

```
GET /api/Alerts/household/{householdId}/category/Bills
GET /api/Alerts/household/{householdId}/category/Healthcare
GET /api/Alerts/household/{householdId}/category/Budget
```

#### Get By Severity

```
GET /api/Alerts/household/{householdId}/severity/Critical
GET /api/Alerts/household/{householdId}/severity/High
```

#### Get Alert Statistics

```
GET /api/Alerts/household/{householdId}/stats
```

Response:
```json
{
  "totalAlerts": 15,
  "unreadAlerts": 12,
  "criticalAlerts": 3,
  "highPriorityAlerts": 5,
  "alertsByCategory": {
    "Bills": 5,
    "Healthcare": 3,
    "Budget": 2
  },
  "alertsBySeverity": {
    "Critical": 3,
    "High": 5,
    "Medium": 7
  }
}
```

### 5. Test Alert Management

#### Mark Alert as Read

```
POST /api/Alerts/{alertId}/mark-read
```

#### Dismiss Alert

```
POST /api/Alerts/{alertId}/dismiss
```

#### Mark All as Read

```
POST /api/Alerts/household/{householdId}/mark-all-read
```

#### Dismiss All

```
POST /api/Alerts/household/{householdId}/dismiss-all
```

---

## 📝 Step 5: Create Test Data

To see alerts in action, you need some test data. Here are quick SQL scripts:

### Create a Test Bill Due Soon

```sql
INSERT INTO bills (
  id, household_id, name, amount, due_date, status, 
  created_at, created_by, updated_at, updated_by
) VALUES (
  gen_random_uuid(),
  'YOUR_HOUSEHOLD_ID',  -- Replace with your household ID
  'Electric Bill',
  127.50,
  CURRENT_DATE + INTERVAL '3 days',  -- Due in 3 days
  'Pending',
  NOW(), 'YOUR_USER_ID', NOW(), 'YOUR_USER_ID'
);
```

### Create an Overdue Bill

```sql
INSERT INTO bills (
  id, household_id, name, amount, due_date, status,
  created_at, created_by, updated_at, updated_by
) VALUES (
  gen_random_uuid(),
  'YOUR_HOUSEHOLD_ID',
  'Water Bill',
  45.00,
  CURRENT_DATE - INTERVAL '2 days',  -- 2 days overdue
  'Pending',
  NOW(), 'YOUR_USER_ID', NOW(), 'YOUR_USER_ID'
);
```

### Create an Upcoming Appointment

```sql
INSERT INTO appointments (
  id, household_id, household_member_id, appointment_date,
  appointment_time, appointment_type, provider_name, status,
  created_at, created_by, updated_at, updated_by
) VALUES (
  gen_random_uuid(),
  'YOUR_HOUSEHOLD_ID',
  'YOUR_HOUSEHOLD_MEMBER_ID',
  CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow
  '10:00:00'::time,
  'Checkup',
  'Dr. Smith',
  'Scheduled',
  NOW(), 'YOUR_USER_ID', NOW(), 'YOUR_USER_ID'
);
```

### After Creating Test Data

Run alert generation manually:

```bash
# Using curl
curl -X POST "https://localhost:7001/api/Alerts/generate/all/YOUR_HOUSEHOLD_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Or wait for the background service to run automatically
```

---

## 🔍 Troubleshooting

### Background Service Not Running

**Check Console Output**: Look for:
```
✅ Alert Generation Background Service enabled
```

If you don't see this, check:
- Is `AlertGeneration:Enabled` set to `true` in `appsettings.Development.json`?
- Is the API running in Development mode?

### No Alerts Generated

**Check:**
1. Do you have active households? Run:
   ```sql
   SELECT id, name, is_active FROM households WHERE deleted_at IS NULL;
   ```

2. Do you have test data (bills, appointments, etc.)?

3. Check API logs for errors:
   ```
   info: TheButler.Api.Services.AlertGenerationService[0]
         Found 0 active households
   ```

### API Base URL Wrong

If you see HTTP errors in logs:
```
Error: Connection refused (localhost:5000)
```

**Fix:** Update `ApiBaseUrl` in `appsettings.Development.json` to match your actual API URL:
- Check `Properties/launchSettings.json` for the correct port
- Common ports: `5000`, `5001`, `7000`, `7001`

### Permission Errors

If you get 403 Forbidden:
```
Household not found
```

**Fix:** Ensure Row Level Security policies are working correctly and your user is a member of the household.

---

## 🎛️ Advanced Configuration

### Disable Background Service

Set in `appsettings.Development.json`:
```json
{
  "AlertGeneration": {
    "Enabled": false
  }
}
```

### Change Alert Generation Frequency

For testing (every 5 minutes):
```json
{
  "AlertGeneration": {
    "IntervalMinutes": 5
  }
}
```

For production (once daily at midnight):
```json
{
  "AlertGeneration": {
    "IntervalMinutes": 1440
  }
}
```

### Production Setup with Hangfire

For production, consider using Hangfire for more robust scheduling:

1. Install Hangfire:
```bash
dotnet add package Hangfire
dotnet add package Hangfire.PostgreSql
```

2. Configure in `Program.cs`:
```csharp
builder.Services.AddHangfire(config => config
    .UsePostgreSqlStorage(connectionString));

builder.Services.AddHangfireServer();

// Schedule recurring job
RecurringJob.AddOrUpdate<AlertGenerationService>(
    "generate-alerts",
    service => service.GenerateAlertsForAllHouseholds(CancellationToken.None),
    Cron.Daily(0)  // Run at midnight
);
```

---

## ✅ Verification Checklist

- [ ] Database migration ran successfully
- [ ] `alerts` table exists with 7 indexes
- [ ] RLS policies are enabled
- [ ] Background service shows "enabled" in console
- [ ] First alert generation cycle ran after 30 seconds
- [ ] Test alerts appear in database
- [ ] GET /api/Alerts endpoints return data
- [ ] Mark as read/dismiss endpoints work
- [ ] Alert stats show correct counts

---

## 📊 Sample Alert Types Generated

### Bills
- **7 days before due**: Reminder, Medium severity
- **3 days before due**: Warning, High severity  
- **Due today**: Warning, Critical severity
- **Overdue**: Error, Critical severity

### Healthcare
- **Appointment in 7 days**: Reminder, Medium
- **Appointment in 3 days**: Reminder, High
- **Appointment tomorrow**: Warning, High
- **Prescription refills ≤ 2**: Warning, Medium

### Insurance
- **Expires in 60 days**: Reminder, Medium
- **Expires in 30 days**: Warning, High
- **Expires in 7 days**: Error, Critical

### Documents
- **Expires in 30 days**: Reminder, Medium
- **Expires in 7 days**: Warning, High

### Budgets
- **80% of budget**: Warning, Medium
- **90% of budget**: Error, High
- **100%+ of budget**: Error, Critical

---

## 🎉 Success!

You now have a fully functional alerts system that:
- ✅ Automatically generates alerts for all household activities
- ✅ Provides comprehensive API endpoints for alert management
- ✅ Runs in the background on a configurable schedule
- ✅ Supports filtering, categorization, and prioritization
- ✅ Integrates with all Butler modules

Next step: Build the frontend UI to display these alerts in your Angular app! 🚀

---

*Last Updated: October 11, 2025*

