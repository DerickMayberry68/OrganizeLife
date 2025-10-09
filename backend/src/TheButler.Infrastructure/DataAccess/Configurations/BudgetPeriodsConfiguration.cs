using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class BudgetPeriodsConfiguration : IEntityTypeConfiguration<BudgetPeriods>
{
    public void Configure(EntityTypeBuilder<BudgetPeriods> builder)
    {
        builder.HasKey(e => e.Id).HasName("budget_periods_pkey");

            builder.ToTable("budget_periods", tb => tb.HasComment("Monthly snapshots of budget performance with auto-calculated metrics."));

            builder.HasIndex(e => new { e.BudgetId, e.PeriodStart }, "budget_periods_budget_id_period_start_key").IsUnique();

            builder.HasIndex(e => new { e.PeriodStart, e.PeriodEnd }, "idx_budget_periods_dates");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.BudgetId).HasColumnName("budget_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.LimitAmount)
                .HasPrecision(15, 2)
                .HasColumnName("limit_amount");
            builder.Property(e => e.PercentageUsed)
                .HasPrecision(5, 2)
                .HasComputedColumnSql("\nCASE\n    WHEN (limit_amount > (0)::numeric) THEN ((spent_amount / limit_amount) * (100)::numeric)\n    ELSE (0)::numeric\nEND", true)
                .HasColumnName("percentage_used");
            builder.Property(e => e.PeriodEnd).HasColumnName("period_end");
            builder.Property(e => e.PeriodStart).HasColumnName("period_start");
            builder.Property(e => e.SpentAmount)
                .HasPrecision(15, 2)
                .HasDefaultValueSql("0.00")
                .HasColumnName("spent_amount");
            builder.Property(e => e.Status)
                .HasMaxLength(50)
                .HasComputedColumnSql("\nCASE\n    WHEN (spent_amount >= limit_amount) THEN 'critical'::text\n    WHEN (spent_amount >= (limit_amount * 0.8)) THEN 'warning'::text\n    ELSE 'good'::text\nEND", true)
                .HasColumnName("status");
            builder.Property(e => e.TransactionCount)
                .HasDefaultValue(0)
                .HasColumnName("transaction_count");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");

            builder.HasOne(d => d.Budget).WithMany(p => p.BudgetPeriods)
                .HasForeignKey(d => d.BudgetId)
                .HasConstraintName("budget_periods_budget_id_fkey");
    }
}
