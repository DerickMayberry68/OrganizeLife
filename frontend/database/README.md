# TheButler Database Schema

## Overview

This PostgreSQL database schema is designed to support TheButler household management application. It is normalized to **Third Normal Form (3NF)** and integrates with **ASP.NET Core Identity** for authentication and authorization.

## 🏗️ Architecture

### Core Principles
- **Household-Centric**: All data is scoped to households, not individual users
- **Multi-User Support**: Multiple users can belong to a household with role-based access (Admin/Member)
- **Audit Trail**: All tables include `created_by`, `created_at`, `updated_by`, `updated_at` fields
- **Soft Deletes**: Most tables support logical deletes via `deleted_at` timestamp
- **Bank Integration Ready**: Schema supports future Plaid integration for transaction imports

## 📊 Schema Structure

### 1. Core Tables

#### `households`
The primary organizational unit. Each household can have multiple members.

#### `household_members`
Links ASP.NET Identity users to households with roles (Admin/Member).
- **Admin**: Full access to all household data
- **Member**: Standard member access

#### `household_settings`
Key-value store for household preferences and configuration.

### 2. Financial Module

#### `accounts`
Financial accounts (checking, savings, credit cards, investments)
- Tracks current balance
- Prepared for Plaid integration (`plaid_account_id`)
- Supports soft delete

#### `transactions`
All income and expense transactions
- **Must** link to an account
- Optional category classification
- Supports split transactions via `parent_transaction_id`
- Auto-updates account balance via trigger
- Prepared for bank imports (`plaid_transaction_id`)

#### `budgets`
Budget definitions per category
- Monthly or yearly periods
- Active/inactive status

#### `budget_periods`
Monthly snapshots of budget performance
- Auto-calculated `percentage_used` and `status` fields
- Auto-updates when transactions are added/modified
- Status: 'good' (< 80%), 'warning' (80-100%), 'critical' (> 100%)

#### `financial_goals`
Savings goals with target amounts and deadlines

#### `subscriptions`
Recurring subscriptions (Netflix, Spotify, etc.)
- Links to account for payment tracking
- Can link to bills if applicable

### 3. Bills & Payments

#### `bills`
Bills to be paid (one-time or recurring)
- Status: paid, pending, overdue
- Optional auto-pay configuration
- Links to accounts for payment source

#### `payment_history`
Historical record of bill payments
- Links to transactions when payment is recorded

### 4. Maintenance Module

#### `service_providers`
**Shared resource** across households
- Contact information and ratings
- Categorized by maintenance type

#### `maintenance_tasks`
Home maintenance tasks and schedules
- Priority levels (low, medium, high, urgent)
- Status tracking (pending, in-progress, completed, scheduled)
- Recurring task support
- Links to service providers

### 5. Inventory Module

#### `inventory_items`
Household items with purchase information
- Location tracking within home
- Photo storage (file paths array)
- Current and purchase value tracking

#### `warranties`
Warranty information for inventory items
- Auto-calculated `is_active` status
- Document URL storage

#### `item_maintenance_schedules`
Recurring maintenance schedules for specific items
- Next due date tracking
- Frequency-based scheduling

### 6. Documents Module

#### `documents`
Digital document vault
- Stores **file paths**, not binary data
- Categorized and taggable
- Expiry date tracking for time-sensitive documents

#### `document_tags`
Many-to-many relationship for flexible tagging

### 7. Insurance Module

#### `insurance_policies`
Insurance policy tracking (home, auto, health, life, etc.)
- Premium and billing frequency
- Renewal date tracking
- Coverage amount and deductible

#### `insurance_beneficiaries`
Policy beneficiaries with percentage allocations

### 8. System Tables

#### `notifications`
User notifications for upcoming events
- Bill due dates
- Maintenance tasks
- Document expiration
- Budget alerts
- Insurance renewals

#### `reminders`
Scheduled reminders with recurrence support
- Links to any entity type
- Tracks sent status

#### `activity_logs`
Complete audit trail of all user actions
- Includes IP address and user agent
- Flexible metadata storage (JSONB)

## 🔑 Key Features

### 1. Automatic Triggers

#### Account Balance Updates
When transactions are inserted/updated/deleted, account balances automatically update.

#### Budget Period Tracking
When transactions are added, budget periods automatically recalculate spent amounts and status.

#### Updated Timestamp
All tables with `updated_at` automatically update this field on modification.

### 2. Computed Columns

- `budget_periods.percentage_used`: Auto-calculated from spent/limit
- `budget_periods.status`: Auto-determined based on percentage used

**Note**: `warranties.is_active` is a regular boolean field. To check for active warranties in queries, use `WHERE end_date >= CURRENT_DATE`.

### 3. Views for Common Queries

#### `v_budget_performance`
Current budget performance across all active budgets

#### `v_upcoming_bills`
Bills due in the next 30 days, sorted by due date

#### `v_expiring_warranties`
Warranties expiring in the next 90 days

## 🚀 Installation

### Prerequisites
- PostgreSQL 12 or higher
- UUID extension (included in schema)

### Setup Steps

1. **Create Database**
   ```sql
   CREATE DATABASE thebutler;
   ```

2. **Run Schema Creation**
   ```bash
   psql -U postgres -d thebutler -f schema.sql
   ```

3. **Load Seed Data**
   ```bash
   psql -U postgres -d thebutler -f seed-data.sql
   ```

4. **Run ASP.NET Core Identity Migrations**
   ```bash
   dotnet ef database update
   ```

## 🔗 ASP.NET Core Integration

### Connection String
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=thebutler;Username=youruser;Password=yourpassword"
  }
}
```

### Entity Framework Core

#### DbContext Configuration
```csharp
public class ButlerDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public DbSet<Household> Households { get; set; }
    public DbSet<HouseholdMember> HouseholdMembers { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<Bill> Bills { get; set; }
    // ... add all other entities

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Configure table names to match PostgreSQL schema
        builder.Entity<Household>().ToTable("households");
        builder.Entity<HouseholdMember>().ToTable("household_members");
        // ... configure all other entities
        
        // Configure UUID as primary key
        builder.Entity<Household>()
            .Property(h => h.Id)
            .HasDefaultValueSql("uuid_generate_v4()");
    }
}
```

#### User-Household Authorization
```csharp
public class HouseholdRequirement : IAuthorizationRequirement
{
    public string Role { get; set; }
}

public class HouseholdAuthorizationHandler : AuthorizationHandler<HouseholdRequirement, Household>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        HouseholdRequirement requirement,
        Household resource)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        var membership = resource.HouseholdMembers
            .FirstOrDefault(m => m.UserId.ToString() == userId);
            
        if (membership != null && 
            (requirement.Role == null || membership.Role == requirement.Role))
        {
            context.Succeed(requirement);
        }
        
        return Task.CompletedTask;
    }
}
```

### Important Notes

1. **UUID Type**: All IDs are UUID (Guid in C#)
2. **Snake Case**: All table/column names use snake_case (PostgreSQL convention)
3. **Timezone Awareness**: All timestamps use `TIMESTAMPTZ` (timezone-aware)
4. **User References**: `created_by`, `updated_by`, `user_id` fields reference `AspNetUsers.Id`
5. **Soft Deletes**: Check `deleted_at IS NULL` in queries for active records

## 📈 Performance Considerations

### Indexes
The schema includes strategic indexes on:
- Foreign key columns
- Date columns (for date range queries)
- Status columns (for filtering)
- Frequently queried combinations

### Partitioning (Future)
Consider partitioning these tables when they grow large:
- `transactions` (by date)
- `activity_logs` (by date)
- `notifications` (by date)

### Archival Strategy
Implement archival for:
- Old activity logs (> 1 year)
- Read notifications (> 90 days)
- Completed maintenance tasks (> 1 year)

## 🔒 Security Recommendations

1. **Row-Level Security (RLS)**: Enable PostgreSQL RLS to enforce household-level data isolation
2. **Encrypted Columns**: Consider encrypting sensitive fields (account numbers, policy numbers)
3. **Audit Logging**: Enable PostgreSQL audit logging for compliance
4. **Backup Strategy**: Implement regular automated backups
5. **Connection Pooling**: Use PgBouncer or similar for connection management

## 📝 Migration Path

When modifying the schema:

1. Create migration SQL file with version number
2. Test on development database
3. Run on staging for validation
4. Document changes in changelog
5. Deploy to production with rollback plan

## 🐛 Common Issues

### Issue: Trigger not firing
**Solution**: Ensure triggers are created after tables exist

### Issue: UUID generation error
**Solution**: Verify `uuid-ossp` extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: Permission denied
**Solution**: Grant proper permissions to application user:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO youruser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO youruser;
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Entity Framework Core - PostgreSQL](https://www.npgsql.org/efcore/)
- [ASP.NET Core Identity](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## 📞 Support

For questions about the schema design, refer to the inline comments in `schema.sql` or contact the development team.

---

**Version**: 1.0  
**Last Updated**: 2025-01-09  
**Maintainer**: TheButler Development Team

