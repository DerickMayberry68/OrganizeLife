# TheButler Database Documentation Index

## 📚 Quick Navigation

### Getting Started
1. **[README.md](README.md)** - Start here! Complete overview, installation, and best practices
2. **[PGADMIN-INSTALL.md](PGADMIN-INSTALL.md)** - pgAdmin 4 installation guide (Windows friendly!)
3. **[CLOUD-DEPLOYMENT.md](CLOUD-DEPLOYMENT.md)** - Deploy to Azure, AWS, GCP, Neon, etc.
4. **[SUPABASE-GUIDE.md](SUPABASE-GUIDE.md)** - ⭐ Supabase-specific setup guide (recommended!)
5. **[identity-schema.sql](identity-schema.sql)** - ASP.NET Core Identity tables (install first!)
6. **[schema.sql](schema.sql)** - The complete PostgreSQL database schema
7. **[seed-data.sql](seed-data.sql)** - Initial lookup table data

### Understanding the Schema
8. **[ERD.md](ERD.md)** - Entity Relationship Diagrams and data flow visualization
9. **[QUERY-REFERENCE.md](QUERY-REFERENCE.md)** - Common SQL queries and examples

### .NET Development
10. **[IDENTITY-SETUP.md](IDENTITY-SETUP.md)** - ASP.NET Core Identity setup and configuration
11. **[DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md)** - ASP.NET Core integration guide with code examples

---

## 🎯 Quick Start Guide

### For Database Administrators

```bash
# 1. Create database
createdb thebutler

# 2. Install ASP.NET Core Identity tables FIRST
psql -d thebutler -f identity-schema.sql

# 3. Run TheButler schema
psql -d thebutler -f schema.sql

# 4. Load seed data
psql -d thebutler -f seed-data.sql

# 5. Verify installation
psql -d thebutler -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
```

### For .NET Developers

1. Read **[DOTNET-INTEGRATION.md](DOTNET-INTEGRATION.md)**
2. Install required NuGet packages
3. Configure connection string in `appsettings.json`
4. Create entity classes for all tables
5. Configure `DbContext` with table mappings
6. Run ASP.NET Core Identity migrations
7. Test with Swagger

### For Frontend Developers

1. Review **[ERD.md](ERD.md)** to understand data relationships
2. Use **[QUERY-REFERENCE.md](QUERY-REFERENCE.md)** for API query examples
3. API endpoints will follow pattern: `/api/households/{householdId}/[resource]`

---

## 📊 Schema Overview

### Statistics
- **32 Application Tables** (TheButler business logic)
- **7 Identity Tables** (ASP.NET Core Identity)
- **4 Lookup Tables** (categories, frequencies, priorities, insurance_types)
- **3 Views** (for common queries)
- **20+ Triggers** (auto-update timestamps, balances, budgets)
- **3NF Normalized** (Third Normal Form)

### Core Modules

| Module | Tables | Key Features |
|--------|--------|--------------|
| **Core** | 3 | Households, Members, Settings |
| **Financial** | 7 | Accounts, Transactions, Budgets, Goals, Subscriptions |
| **Bills** | 2 | Bills, Payment History |
| **Maintenance** | 2 | Tasks, Service Providers |
| **Inventory** | 3 | Items, Warranties, Schedules |
| **Documents** | 2 | Documents, Tags |
| **Insurance** | 3 | Policies, Beneficiaries, Types |
| **System** | 3 | Notifications, Reminders, Activity Logs |
| **Lookup** | 4 | Categories, Frequencies, Priorities, Insurance Types |

---

## 🔑 Key Features

### ✅ Implemented
- [x] Multi-household support
- [x] Role-based access (Admin/Member)
- [x] Full audit trail (created_by, created_at, updated_by, updated_at)
- [x] Soft delete support (deleted_at)
- [x] Auto-update account balances (triggers)
- [x] Auto-calculate budget performance (triggers)
- [x] Bank integration ready (Plaid fields)
- [x] File storage paths (documents, photos)
- [x] Notification system
- [x] Activity logging
- [x] Flexible settings per household

### 🔮 Future Enhancements
- [ ] Row-level security (PostgreSQL RLS)
- [ ] Table partitioning for large tables
- [ ] Data archival strategy
- [ ] Document versioning
- [ ] Multi-currency support
- [ ] Advanced reporting views
- [ ] Data export/import utilities

---

## 🎓 Learning Resources

### Database Concepts
- **3NF (Third Normal Form)**: See ERD.md for normalization examples
- **Soft Deletes**: Tables with `deleted_at` support logical deletion
- **Triggers**: Auto-update calculated fields and balances
- **Views**: Pre-computed queries for common reports
- **JSONB**: Flexible metadata storage in activity_logs

### PostgreSQL Features Used
- UUID primary keys with `uuid_generate_v4()`
- TIMESTAMPTZ for timezone-aware timestamps
- Array columns for photos and tags
- Computed/generated columns (GENERATED ALWAYS AS)
- Partial indexes (WHERE clause)
- Check constraints for data validation

---

## 🚀 Common Tasks

### Initial Setup
```bash
cd database
psql -d thebutler -f schema.sql
psql -d thebutler -f seed-data.sql
```

### Backup Database
```bash
pg_dump thebutler > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
psql thebutler < backup_20250109.sql
```

### Add a New Household
```sql
INSERT INTO households (name, created_by, updated_by)
VALUES ('Smith Family', 'USER_ID', 'USER_ID')
RETURNING id;
```

### Add User to Household
```sql
INSERT INTO household_members (household_id, user_id, role, created_by, updated_by)
VALUES ('HOUSEHOLD_ID', 'USER_ID', 'Admin', 'USER_ID', 'USER_ID');
```

---

## 🔒 Security Checklist

- [ ] Enable SSL for database connections
- [ ] Use connection pooling (PgBouncer)
- [ ] Set up read-only replicas for reporting
- [ ] Enable PostgreSQL audit logging
- [ ] Implement row-level security policies
- [ ] Encrypt sensitive columns (account numbers, SSNs)
- [ ] Regular automated backups
- [ ] Test disaster recovery procedures
- [ ] Monitor for suspicious activity
- [ ] Keep PostgreSQL version updated

---

## 📞 Support & Contribution

### Getting Help
1. Check **[README.md](README.md)** for common issues
2. Review **[QUERY-REFERENCE.md](QUERY-REFERENCE.md)** for SQL examples
3. Consult **[ERD.md](ERD.md)** for data relationships
4. Check inline comments in **[schema.sql](schema.sql)**

### Reporting Issues
When reporting database issues, include:
- PostgreSQL version (`SELECT version();`)
- Table name and query causing issue
- Error message (full text)
- Expected vs actual behavior
- Sample data (anonymized)

### Contributing
1. Test changes on development database first
2. Document schema changes in migration files
3. Update ERD if relationships change
4. Add queries to QUERY-REFERENCE.md
5. Update version number in README.md

---

## 📋 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-09 | Initial schema creation |
| | | - 32 tables with full audit trails |
| | | - ASP.NET Core Identity integration |
| | | - Automatic triggers for balance/budget updates |
| | | - Comprehensive documentation |

---

## 🗂️ File Descriptions

| File | Purpose | Primary Audience |
|------|---------|------------------|
| **identity-schema.sql** | ASP.NET Core Identity tables | DBAs, Backend Devs |
| **schema.sql** | Complete database schema | DBAs, Backend Devs |
| **seed-data.sql** | Lookup table initial data | DBAs |
| **README.md** | Installation & overview | Everyone |
| **PGADMIN-INSTALL.md** | pgAdmin 4 installation guide | DBAs, Windows Users |
| **CLOUD-DEPLOYMENT.md** | Cloud deployment guide | DevOps, DBAs |
| **SUPABASE-GUIDE.md** | Supabase-specific setup | DBAs, Backend Devs |
| **ERD.md** | Visual schema documentation | Architects, Devs |
| **QUERY-REFERENCE.md** | SQL query examples | Backend Devs, DBAs |
| **IDENTITY-SETUP.md** | Identity configuration guide | Backend Devs |
| **DOTNET-INTEGRATION.md** | .NET code examples | Backend Devs |
| **INDEX.md** | This file - navigation guide | Everyone |

---

## 🎯 Next Steps

### For New Projects
1. ✅ Read README.md
2. ✅ Run schema.sql and seed-data.sql
3. ✅ Review ERD.md
4. ✅ Set up .NET project per DOTNET-INTEGRATION.md
5. ✅ Create your first household via API
6. ✅ Test with sample data

### For Existing Projects
1. ✅ Review schema changes
2. ✅ Create migration scripts
3. ✅ Test on staging environment
4. ✅ Back up production database
5. ✅ Deploy schema updates
6. ✅ Monitor for issues

---

**Current Version**: 1.0  
**Last Updated**: 2025-01-09  
**Maintainer**: TheButler Development Team  
**License**: Proprietary

For technical questions, consult the relevant documentation file above. For business questions, contact the project manager.

