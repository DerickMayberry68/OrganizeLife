# Installing TheButler Database with pgAdmin 4

## Step-by-Step Guide

### Step 1: Create the Database

1. Open **pgAdmin 4**
2. In the left panel, expand your **PostgreSQL server**
3. Right-click on **Databases** → **Create** → **Database...**
4. Enter database name: `thebutler`
5. Owner: Select your user (usually `postgres`)
6. Click **Save**

### Step 2: Open Query Tool

1. In the left panel, click on the **thebutler** database to select it
2. Click **Tools** menu → **Query Tool** (or press `Alt+Shift+Q`)
3. A new query editor window will open

### Step 3: Run Identity Schema

1. In the Query Tool, click the **Open File** icon (folder icon) or press `Ctrl+O`
2. Navigate to your project folder:
   ```
   C:\Users\deric\source\repos\StudioXConsulting\Projects\TheButler\database
   ```
3. Select **`identity-schema.sql`**
4. Click **Open**
5. The SQL script will load into the editor
6. Click the **Execute/Run** button (▶ icon) or press `F5`
7. Wait for execution to complete
8. Check the **Messages** tab at the bottom - should see "Query returned successfully"
9. Verify in **Data Output** tab that 7 Identity tables were created

### Step 4: Run TheButler Schema

1. Clear the query editor (or open a new Query Tool)
2. Click **Open File** icon again
3. Select **`schema.sql`**
4. Click **Open**
5. Click **Execute/Run** button (▶) or press `F5`
6. This may take 10-20 seconds - wait for completion
7. Check **Messages** tab for success
8. You should see 32 application tables created

### Step 5: Run Seed Data

1. Clear the query editor (or open a new Query Tool)
2. Click **Open File** icon
3. Select **`seed-data.sql`**
4. Click **Open**
5. Click **Execute/Run** button (▶) or press `F5`
6. Check **Messages** tab for successful inserts

### Step 6: Verify Installation

1. In the left panel, expand **thebutler** database
2. Expand **Schemas** → **public** → **Tables**
3. You should see **39 tables** total:
   - **7 Identity tables** starting with `AspNet`
   - **32 Application tables** (households, accounts, bills, etc.)

**Quick verification query:**
```sql
-- Run this in Query Tool
SELECT COUNT(*) as total_tables 
FROM pg_tables 
WHERE schemaname = 'public';
```
Should return: **39**

```sql
-- Check Identity tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'AspNet%'
ORDER BY tablename;
```
Should return 7 tables.

```sql
-- Check seed data loaded
SELECT COUNT(*) as category_count FROM categories;
```
Should return around **50+** categories.

---

## Troubleshooting

### Issue: "ERROR: extension uuid-ossp does not exist"

**Solution:**
1. Right-click on your **thebutler** database in left panel
2. Select **Query Tool**
3. Run this command:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
4. Then run the schema scripts again

### Issue: Script runs but some commands fail

**Solution:**
- Check the **Messages** tab at the bottom for specific error messages
- Scroll through to find the first error (subsequent errors may be cascading)
- If you see errors about existing tables, you may need to drop and recreate:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO postgres;
  GRANT ALL ON SCHEMA public TO public;
  ```
  Then run the scripts again from Step 3.

### Issue: "relation already exists"

**Solution:** The table already exists. Either:
1. Drop the database and start over, OR
2. Skip that particular error if you're re-running scripts

To drop and recreate:
1. In left panel, right-click on **thebutler** database
2. Select **Delete/Drop**
3. Check "Drop CASCADE" option
4. Click **OK**
5. Start again from Step 1

### Issue: Permission denied

**Solution:**
1. Make sure you're connected as a superuser (usually `postgres`)
2. Or grant proper permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE thebutler TO your_username;
   ```

---

## Tips for Using pgAdmin 4

### Running Partial Scripts
- You can highlight specific SQL statements and press `F5` to run only those lines
- Useful for testing individual CREATE TABLE statements

### Viewing Table Structure
1. In left panel, expand **Tables**
2. Right-click on any table (e.g., `AspNetUsers`)
3. Select **Properties** to see columns, indexes, constraints

### Viewing Data
1. Right-click on a table
2. Select **View/Edit Data** → **All Rows**
3. View/edit data in a grid

### Query History
- pgAdmin saves your query history
- Click **History** tab in Query Tool to see previous queries

### Export Query Results
- After running a query, right-click on results
- Select **Copy** → **CSV** or other formats

### Multiple Query Tabs
- You can have multiple Query Tool windows open
- Useful for comparing results or running multiple queries

---

## Keyboard Shortcuts in Query Tool

| Action | Shortcut |
|--------|----------|
| Execute query | `F5` |
| Execute selected | `Ctrl+Shift+Q` |
| Open file | `Ctrl+O` |
| Save query | `Ctrl+S` |
| Find | `Ctrl+F` |
| Comment/Uncomment | `Ctrl+/` |
| Auto-complete | `Ctrl+Space` |
| Clear query window | `Ctrl+L` |

---

## Visual Verification Checklist

After installation, verify in pgAdmin:

### Tables Tab
- [ ] Expand **Tables** - should see 39 tables
- [ ] See 7 tables starting with `AspNet`
- [ ] See `households`, `accounts`, `bills`, etc.

### Views Tab
- [ ] Expand **Views** - should see 3 views
- [ ] `v_budget_performance`
- [ ] `v_upcoming_bills`
- [ ] `v_expiring_warranties`

### Functions Tab
- [ ] Expand **Functions** - should see several functions
- [ ] `update_updated_at_column()`
- [ ] `update_account_balance()`
- [ ] `update_budget_period_spent()`

### Extensions Tab
- [ ] Expand **Extensions** - should see `uuid-ossp`

---

## Next Steps

Now that your database is installed:

1. ✅ Note your connection details:
   - Host: `localhost` (or your server address)
   - Port: `5432` (default)
   - Database: `thebutler`
   - Username: `postgres` (or your user)
   - Password: (your password)

2. ✅ Connection string for .NET:
   ```
   Host=localhost;Database=thebutler;Username=postgres;Password=YOUR_PASSWORD;Include Error Detail=true
   ```

3. ✅ Review these guides:
   - [IDENTITY-SETUP.md](IDENTITY-SETUP.md) - Configure ASP.NET Core Identity
   - [DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md) - Build your .NET API
   - [QUERY-REFERENCE.md](QUERY-REFERENCE.md) - Useful SQL queries

---

## Quick Reference: File Execution Order

1. **identity-schema.sql** ← Start here
2. **schema.sql** ← Then this
3. **seed-data.sql** ← Finally this

**Total execution time:** ~1-2 minutes

---

## pgAdmin 4 Features to Explore

### Dashboard
- Shows server activity
- Active connections
- Database size
- Session statistics

### ER Diagram (Entity Relationship Diagram)
1. Right-click on **thebutler** database
2. Select **ERD For Database**
3. View visual representation of all tables and relationships

### Backup/Restore
1. Right-click on **thebutler** database
2. Select **Backup...** to create a backup
3. Select **Restore...** to restore from backup

### Grant Wizard
1. Right-click on **thebutler** database
2. Select **Grant Wizard...** to manage permissions

---

**Happy Database Setup!** 🎩✨

If you encounter any issues, check the **Messages** tab in pgAdmin for specific error details.

