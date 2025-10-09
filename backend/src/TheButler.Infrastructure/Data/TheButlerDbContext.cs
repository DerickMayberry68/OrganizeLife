using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;
using TheButler.Core.Domain.Interfaces;

namespace TheButler.Infrastructure.Data;

public partial class TheButlerDbContext : DbContext, IDbContext
{
    public TheButlerDbContext(DbContextOptions<TheButlerDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Accounts> Accounts { get; set; }

    public virtual DbSet<ActivityLogs> ActivityLogs { get; set; }

    public virtual DbSet<Bills> Bills { get; set; }

    public virtual DbSet<BudgetPeriods> BudgetPeriods { get; set; }

    public virtual DbSet<Budgets> Budgets { get; set; }

    public virtual DbSet<Categories> Categories { get; set; }

    public virtual DbSet<DocumentTags> DocumentTags { get; set; }

    public virtual DbSet<Documents> Documents { get; set; }

    public virtual DbSet<FinancialGoals> FinancialGoals { get; set; }

    public virtual DbSet<Frequencies> Frequencies { get; set; }

    public virtual DbSet<HouseholdMembers> HouseholdMembers { get; set; }

    public virtual DbSet<HouseholdSettings> HouseholdSettings { get; set; }

    public virtual DbSet<Households> Households { get; set; }

    public virtual DbSet<InsuranceBeneficiaries> InsuranceBeneficiaries { get; set; }

    public virtual DbSet<InsurancePolicies> InsurancePolicies { get; set; }

    public virtual DbSet<InsuranceTypes> InsuranceTypes { get; set; }

    public virtual DbSet<InventoryItems> InventoryItems { get; set; }

    public virtual DbSet<ItemMaintenanceSchedules> ItemMaintenanceSchedules { get; set; }

    public virtual DbSet<MaintenanceTasks> MaintenanceTasks { get; set; }

    public virtual DbSet<Notifications> Notifications { get; set; }

    public virtual DbSet<PaymentHistory> PaymentHistory { get; set; }

    public virtual DbSet<Priorities> Priorities { get; set; }

    public virtual DbSet<Reminders> Reminders { get; set; }

    public virtual DbSet<ServiceProviders> ServiceProviders { get; set; }

    public virtual DbSet<Subscriptions> Subscriptions { get; set; }

    public virtual DbSet<Transactions> Transactions { get; set; }

    public virtual DbSet<VBudgetPerformance> VBudgetPerformance { get; set; }

    public virtual DbSet<VExpiringWarranties> VExpiringWarranties { get; set; }

    public virtual DbSet<VUpcomingBills> VUpcomingBills { get; set; }

    public virtual DbSet<Warranties> Warranties { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Postgres enums and extensions
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        // Configure database views (no configuration files needed for views)
        modelBuilder.Entity<VBudgetPerformance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_budget_performance");

            entity.Property(e => e.BudgetId).HasColumnName("budget_id");
            entity.Property(e => e.BudgetName)
                .HasMaxLength(200)
                .HasColumnName("budget_name");
            entity.Property(e => e.CategoryName)
                .HasMaxLength(100)
                .HasColumnName("category_name");
            entity.Property(e => e.HouseholdId).HasColumnName("household_id");
            entity.Property(e => e.LimitAmount)
                .HasPrecision(15, 2)
                .HasColumnName("limit_amount");
            entity.Property(e => e.PercentageUsed)
                .HasPrecision(5, 2)
                .HasColumnName("percentage_used");
            entity.Property(e => e.PeriodEnd).HasColumnName("period_end");
            entity.Property(e => e.PeriodStart).HasColumnName("period_start");
            entity.Property(e => e.SpentAmount)
                .HasPrecision(15, 2)
                .HasColumnName("spent_amount");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.TransactionCount).HasColumnName("transaction_count");
        });

        modelBuilder.Entity<VExpiringWarranties>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_expiring_warranties");

            entity.Property(e => e.DaysUntilExpiry).HasColumnName("days_until_expiry");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.HouseholdId).HasColumnName("household_id");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ItemName)
                .HasMaxLength(200)
                .HasColumnName("item_name");
            entity.Property(e => e.Provider)
                .HasMaxLength(200)
                .HasColumnName("provider");
        });

        modelBuilder.Entity<VUpcomingBills>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_upcoming_bills");

            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            entity.Property(e => e.CategoryName)
                .HasMaxLength(100)
                .HasColumnName("category_name");
            entity.Property(e => e.DaysOverdue).HasColumnName("days_overdue");
            entity.Property(e => e.DueDate).HasColumnName("due_date");
            entity.Property(e => e.HouseholdId).HasColumnName("household_id");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
        });

        // Apply all entity configurations from separate configuration classes
        // Configurations are located in DataAccess/Configurations/*.cs
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TheButlerDbContext).Assembly);

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
