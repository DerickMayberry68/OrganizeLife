using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class FinancialGoalsConfiguration : IEntityTypeConfiguration<FinancialGoals>
{
    public void Configure(EntityTypeBuilder<FinancialGoals> builder)
    {
        builder.HasKey(e => e.Id).HasName("financial_goals_pkey");

            builder.ToTable("financial_goals");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AchievedDate).HasColumnName("achieved_date");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.CurrentAmount)
                .HasPrecision(15, 2)
                .HasDefaultValueSql("0.00")
                .HasColumnName("current_amount");
            builder.Property(e => e.Deadline).HasColumnName("deadline");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsAchieved)
                .HasDefaultValue(false)
                .HasColumnName("is_achieved");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.PriorityId).HasColumnName("priority_id");
            builder.Property(e => e.TargetAmount)
                .HasPrecision(15, 2)
                .HasColumnName("target_amount");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Household).WithMany(p => p.FinancialGoals)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("financial_goals_household_id_fkey");

            builder.HasOne(d => d.Priority).WithMany(p => p.FinancialGoals)
                .HasForeignKey(d => d.PriorityId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("financial_goals_priority_id_fkey");
    }
}
