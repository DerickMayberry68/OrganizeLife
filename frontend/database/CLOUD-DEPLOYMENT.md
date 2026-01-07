# Cloud PostgreSQL Deployment Guide

This guide covers deploying OrganizeLife database to popular cloud PostgreSQL services and replicating your local setup.

---

## 🌐 Supported Cloud Services

- **Azure Database for PostgreSQL**
- **AWS RDS for PostgreSQL**
- **Google Cloud SQL for PostgreSQL**
- **Neon (Serverless PostgreSQL)**
- **Supabase**
- **DigitalOcean Managed Databases**
- **Railway**
- **Render**

---

## 📋 Prerequisites

1. ✅ PostgreSQL client tools installed (`psql` command available)
2. ✅ Cloud database instance created and running
3. ✅ Connection details from your cloud provider
4. ✅ Firewall rules configured to allow your IP

---

## 🚀 Quick Deployment with install.bat

### Basic Usage

```bash
cd database

# Set password as environment variable (recommended)
set PGPASSWORD=your_cloud_password

# Run installation
install.bat --db-host your-server.postgres.database.azure.com --db-user your_username@your_server --db-name organizelife --db-port 5432
```

### Command Options

```bash
install.bat [options]

Options:
  --db-name NAME    Database name (default: organizelife)
  --db-user USER    Database user (default: postgres)
  --db-host HOST    Database host (default: localhost)
  --db-port PORT    Database port (default: 5432)
  --help            Show help message
```

---

## ☁️ Cloud Provider Examples

### Azure Database for PostgreSQL

**Connection Details from Azure Portal:**

- Server name: `organizelife-server.postgres.database.azure.com`
- Admin username: `organizelifeadmin@organizelife-server`
- Port: `5432`
- SSL: Required

**Installation:**

```bash
cd database

# Set password
set PGPASSWORD=YourAzurePassword123!

# Install (database must exist or use postgres database initially)
install.bat --db-host organizelife-server.postgres.database.azure.com --db-user organizelifeadmin@organizelife-server --db-name organizelife --db-port 5432

# Note: Azure requires username@servername format
```

**Connection String for .NET:**

```text
Host=organizelife-server.postgres.database.azure.com;Database=organizelife;Username=organizelifeadmin@organizelife-server;Password=YourAzurePassword123!;SSL Mode=Require;Trust Server Certificate=true
```

**Azure Tips:**

- Enable "Allow access to Azure services" in Firewall settings
- Add your local IP to firewall rules
- Consider using Azure Key Vault for password management
- Use flexible server for better performance

---

### AWS RDS for PostgreSQL

**Connection Details from AWS Console:**

- Endpoint: `organizelife-db.c9akl90b3jya.us-east-1.rds.amazonaws.com`
- Port: `5432`
- Master username: `postgres`

**Installation:**

```bash
cd database

# Set password
set PGPASSWORD=YourRDSPassword123!

# Install
install.bat --db-host organizelife-db.c9akl90b3jya.us-east-1.rds.amazonaws.com --db-user postgres --db-name organizelife --db-port 5432
```

**Connection String for .NET:**

```text
Host=organizelife-db.c9akl90b3jya.us-east-1.rds.amazonaws.com;Database=organizelife;Username=postgres;Password=YourRDSPassword123!;SSL Mode=Require
```

**AWS Tips:**

- Modify security group to allow inbound traffic on port 5432
- Use AWS Secrets Manager for credentials
- Enable automated backups
- Consider Multi-AZ deployment for production

---

### Google Cloud SQL for PostgreSQL

**Connection Details from GCP Console:**

- Public IP: `34.123.45.67`
- Instance connection name: `your-project:us-central1:organizelife-db`
- Username: `postgres`
- Port: `5432`

**Installation:**

```bash
cd database

# Set password
set PGPASSWORD=YourGCPPassword123!

# Install (using public IP)
install.bat --db-host 34.123.45.67 --db-user postgres --db-name organizelife --db-port 5432
```

**Connection String for .NET:**

```text
Host=34.123.45.67;Database=organizelife;Username=postgres;Password=YourGCPPassword123!;SSL Mode=Require
```

**GCP Tips:**

- Add authorized networks in Connections tab
- Use Cloud SQL Proxy for secure connections
- Enable automatic backups
- Use private IP for better security when possible

---

### Neon (Serverless PostgreSQL)

**Connection Details from Neon Dashboard:**

- Host: `ep-cool-darkness-123456.us-east-2.aws.neon.tech`
- User: `neondb_owner`
- Port: `5432`
- Database: `neondb` (default)

**Installation:**

```bash
cd database

# Set password
set PGPASSWORD=your-neon-password

# Install
install.bat --db-host ep-cool-darkness-123456.us-east-2.aws.neon.tech --db-user neondb_owner --db-name organizelife --db-port 5432
```

**Connection String for .NET:**

```text
Host=ep-cool-darkness-123456.us-east-2.aws.neon.tech;Database=organizelife;Username=neondb_owner;Password=your-neon-password;SSL Mode=Require
```

**Neon Tips:**

- No firewall configuration needed
- Auto-scales to zero (serverless)
- Great for development/testing
- Free tier available

---

### Supabase

**Connection Details from Supabase Dashboard:**

- Host: `db.yourproject.supabase.co`
- User: `postgres`
- Port: `5432`
- Database: `postgres`

**Installation:**

```bash
cd database

# Set password (from Supabase settings)
set PGPASSWORD=your-supabase-db-password

# Install
install.bat --db-host https://cwvkrkiejntyexfxzxpx.supabase.co --db-user postgres --db-name postgres --db-port 5432
```

**Connection String for .NET:**

```text
Host=db.yourproject.supabase.co;Database=postgres;Username=postgres;Password=your-supabase-db-password;SSL Mode=Require
```

**Supabase Tips:**

- Includes built-in authentication (if you want to use instead of Identity)
- Provides instant REST API
- Built-in realtime subscriptions
- Free tier available

---

### DigitalOcean Managed Databases

**Connection Details from DO Control Panel:**

- Host: `organizelife-db-do-user-12345-0.b.db.ondigitalocean.com`
- Port: `25060` (note: custom port!)
- User: `doadmin`
- Database: `defaultdb`

**Installation:**

```bash
cd database

# Set password
set PGPASSWORD=your-do-password

# Install (note custom port 25060)
install.bat --db-host organizelife-db-do-user-12345-0.b.db.ondigitalocean.com --db-user doadmin --db-name organizelife --db-port 25060
```

**Connection String for .NET:**

```
Host=organizelife-db-do-user-12345-0.b.db.ondigitalocean.com;Database=organizelife;Port=25060;Username=doadmin;Password=your-do-password;SSL Mode=Require
```

**DigitalOcean Tips:**

- Trusted sources automatically include your droplets
- Automatic daily backups included
- Connection pooling available
- Uses custom port (25060 by default)

---

## 🔄 Replicating Local to Cloud

### Step 1: Test Locally First

```bash
cd database
install.bat
# Verify everything works locally
```

### Step 2: Export Local Data (if needed)

```bash
# Export just schema
pg_dump -h localhost -U postgres -d organizelife --schema-only -f organizelife-schema-backup.sql

# Export data only
pg_dump -h localhost -U postgres -d organizelife --data-only -f organizelife-data-backup.sql

# Export everything
pg_dump -h localhost -U postgres -d organizelife -f organizelife-full-backup.sql
```

### Step 3: Deploy to Cloud

```bash
# Set cloud password
set PGPASSWORD=YourCloudPassword

# Run install script with cloud parameters
install.bat --db-host your-cloud-host.com --db-user your_user --db-name organizelife --db-port 5432
```

### Step 4: Import Additional Data (if needed)

```bash
# If you exported data from local
psql -h your-cloud-host.com -U your_user -d organizelife -f organizelife-data-backup.sql
```

---

## 🔐 Security Best Practices

### 1. Use Environment Variables

**PowerShell:**

```powershell
# Set for current session
$env:PGPASSWORD = "YourSecurePassword"

# Set permanently (user level)
[System.Environment]::SetEnvironmentVariable('PGPASSWORD', 'YourSecurePassword', 'User')

# Run install
cd database
.\install.bat --db-host cloud-host.com --db-user admin
```

### 2. Use .pgpass File (Windows)

Create `%APPDATA%\postgresql\pgpass.conf`:

```
# Format: hostname:port:database:username:password
cloud-host.com:5432:organizelife:admin:YourPassword
localhost:5432:*:postgres:LocalPassword
```

Set file permissions (right-click → Properties → Security)

### 3. Use Connection Pooling

For production, use connection pooling:

- **PgBouncer** (recommended)
- **Azure Database for PostgreSQL** (built-in)
- **AWS RDS Proxy**

### 4. SSL/TLS Configuration

Always use SSL in production:

```
SSL Mode=Require;Trust Server Certificate=true
```

For production, use certificate verification:

```
SSL Mode=Require;SSL Certificate=path/to/server-ca.pem
```

---

## 📊 Post-Deployment Verification

### Quick Health Check

```bash
# Set connection details
set PGHOST=your-cloud-host.com
set PGPORT=5432
set PGUSER=your_user
set PGDATABASE=organizelife
set PGPASSWORD=your_password

# Check tables
psql -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
# Should return: 39

# Check Identity tables
psql -c "SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'AspNet%' ORDER BY tablename;"
# Should list 7 tables

# Check seed data
psql -c "SELECT COUNT(*) FROM categories;"
# Should return: 50+

# Check views
psql -c "SELECT COUNT(*) FROM pg_views WHERE schemaname='public';"
# Should return: 3

# Check functions
psql -c "SELECT COUNT(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace;"
# Should return: 3+
```

---

## 🔄 Continuous Deployment Workflow

### Development → Testing → Production

```bash
# 1. Local Development
install.bat

# 2. Deploy to Testing/Staging
set PGPASSWORD=TestingPassword
install.bat --db-host test-db.cloud.com --db-user test_admin --db-name organizelife_test

# 3. Run tests, verify...

# 4. Deploy to Production
set PGPASSWORD=ProductionPassword
install.bat --db-host prod-db.cloud.com --db-user prod_admin --db-name organizelife

# 5. Verify production
psql -h prod-db.cloud.com -U prod_admin -d organizelife -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
```

---

## 🐛 Troubleshooting Cloud Deployments

### Issue: Connection Timeout

**Symptoms:** Script hangs or "connection timed out"

**Solutions:**

1. Check firewall rules - add your IP address
2. Verify security group settings (AWS)
3. Check network security group (Azure)
4. Try from a different network
5. Use VPN if required

### Issue: Authentication Failed

**Symptoms:** "password authentication failed"

**Solutions:**

1. Verify username format (Azure requires `user@server`)
2. Check password is correct (no special shell characters)
3. Verify user has CREATE DATABASE privilege
4. Check SSL requirements

### Issue: SSL Required

**Symptoms:** "SSL connection is required"

**Solutions:**

```bash
# Add sslmode parameter
psql "host=your-host.com port=5432 dbname=organizelife user=admin sslmode=require"

# Or download SSL certificate
psql "host=your-host.com port=5432 dbname=organizelife user=admin sslmode=verify-full sslrootcert=server-ca.pem"
```

### Issue: Database Already Exists Error

**Symptoms:** "database already exists"

**Solutions:**

1. Script will prompt you to drop and recreate
2. Or manually drop: `DROP DATABASE organizelife;`
3. Or use a different database name

### Issue: Permission Denied

**Symptoms:** "permission denied to create database"

**Solutions:**

1. Ensure user has CREATEDB privilege
2. Connect as superuser initially
3. Grant privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE organizelife TO your_user;
ALTER USER your_user CREATEDB;
```

---

## 💡 Cloud-Specific Tips

### Cost Optimization

- **Start Small**: Begin with smallest instance size
- **Auto-Scaling**: Enable where available (Neon, Supabase)
- **Backups**: Configure retention period (7-30 days typical)
- **Monitoring**: Set up alerts for high usage
- **Development**: Use free tiers for dev/test (Neon, Supabase, Railway)

### Performance

- **Connection Pooling**: Use PgBouncer or cloud-native pooling
- **Indexes**: Already included in schema.sql
- **Monitoring**: Enable slow query logs
- **Caching**: Consider Redis for application caching

### Backup Strategy

```bash
# Automated daily backup script
@echo off
set BACKUP_DIR=C:\Backups\OrganizeLife
set TIMESTAMP=%DATE:~-4%%DATE:~-7,2%%DATE:~-10,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

set PGPASSWORD=YourCloudPassword

pg_dump -h your-cloud-host.com -U admin -d organizelife -F c -f "%BACKUP_DIR%\organizelife_%TIMESTAMP%.backup"

echo Backup completed: organizelife_%TIMESTAMP%.backup
```

---

## 📚 Additional Resources

### Cloud Provider Documentation

- [Azure PostgreSQL Docs](https://docs.microsoft.com/azure/postgresql/)
- [AWS RDS PostgreSQL Docs](https://docs.aws.amazon.com/rds/postgresql/)
- [GCP Cloud SQL Docs](https://cloud.google.com/sql/docs/postgres)
- [Neon Docs](https://neon.tech/docs)
- [Supabase Docs](https://supabase.com/docs)

### Related OrganizeLife Guides

- [install.bat Reference](../database/) - Installation script
- [IDENTITY-SETUP.md](IDENTITY-SETUP.md) - ASP.NET Core Identity setup
- [DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md) - .NET API integration
- [README.md](README.md) - Database documentation

---

## ✅ Cloud Deployment Checklist

- [ ] Cloud PostgreSQL instance created
- [ ] Firewall rules configured
- [ ] Connection details obtained
- [ ] `psql` client installed
- [ ] Password set as environment variable
- [ ] Ran `install.bat` with cloud parameters
- [ ] Verified 39 tables created
- [ ] Verified seed data loaded
- [ ] Connection string saved for .NET
- [ ] Backup strategy configured
- [ ] Monitoring/alerts set up

---

**Ready to deploy?** Run the installation script with your cloud parameters and you'll have OrganizeLife database running in minutes!

```bash
cd database
set PGPASSWORD=YourCloudPassword
install.bat --db-host your-cloud-host.com --db-user your_user --db-name organizelife
```
