# 🚀 Alerts System - Quick Start

## ⚡ 3-Minute Setup

### 1️⃣ Run Database Migration (1 minute)

**Open Supabase SQL Editor**: https://supabase.com/dashboard

**Paste & Run**: `database-migrations/add-alerts-table.sql`

✅ Done! You should see "Alerts table migration completed successfully!"

---

### 2️⃣ Configure Background Service (30 seconds)

Already done! Check `appsettings.Development.json`:

```json
{
  "AlertGeneration": {
    "Enabled": true,
    "IntervalMinutes": 60
  }
}
```

💡 **For quick testing**, change to `"IntervalMinutes": 5`

---

### 3️⃣ Start API (30 seconds)

```bash
cd src/TheButler.Api
dotnet run
```

Look for:
```
✅ Alert Generation Background Service enabled
```

---

### 4️⃣ Test It! (1 minute)

#### Option A: PowerShell Script

1. Edit `test-alerts.ps1`:
   - Replace `YOUR_HOUSEHOLD_ID_HERE` with your household ID
   - Replace `YOUR_JWT_TOKEN_HERE` with your token (if auth enabled)

2. Run:
```powershell
.\test-alerts.ps1
```

#### Option B: Swagger UI

1. Open: `https://localhost:7001/swagger`
2. Test: `POST /api/Alerts/generate/all/{householdId}`
3. View: `GET /api/Alerts/household/{householdId}`

---

## 📊 What Gets Generated?

The system automatically creates alerts for:

| Category | Triggers |
|----------|----------|
| **Bills** | 7 days, 3 days, due today, overdue |
| **Healthcare** | Appointments (7d, 3d, 1d), Refills (≤2) |
| **Insurance** | Expiring policies (60d, 30d, 7d) |
| **Documents** | Expiring docs (30d, 7d) |
| **Maintenance** | Tasks due (7d, 3d, overdue) |
| **Budget** | 80%, 90%, 100% thresholds |
| **Inventory** | ⚠️ Disabled (needs model updates) |

---

## 🎯 Key Endpoints

```
POST /api/Alerts/generate/all/{householdId}    # Generate all alerts
GET  /api/Alerts/household/{householdId}       # Get all alerts
GET  /api/Alerts/household/{householdId}/stats # Statistics
POST /api/Alerts/{id}/mark-read               # Mark as read
POST /api/Alerts/household/{householdId}/mark-all-read  # Mark all
```

---

## 🔍 Quick Checks

### Check Background Service Logs

Look for in console:
```
Starting alert generation cycle at...
Found X active households
Generated Y alerts for household...
```

### Check Database

```sql
SELECT COUNT(*) FROM alerts;
SELECT category, COUNT(*) FROM alerts GROUP BY category;
```

### Check API Health

```bash
# PowerShell
Invoke-RestMethod https://localhost:7001/api/Alerts/household/YOUR_ID/stats
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Household not found" | Use a valid household ID from your database |
| No alerts generated | Add test data (bills, appointments, etc.) |
| Background service not running | Check `appsettings.Development.json` |
| 403 Forbidden | Check JWT token or disable auth for testing |

---

## 📚 Full Documentation

See `ALERTS-SETUP-GUIDE.md` for:
- Detailed configuration options
- Creating test data
- Production setup with Hangfire
- Complete API reference
- Troubleshooting guide

---

## ✨ That's It!

Your alerts system is now:
- ✅ Running automatically every hour (or as configured)
- ✅ Generating smart notifications
- ✅ Ready for frontend integration

**Next:** Build the Angular UI to display these alerts! 🎨

