using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class BudgetsConfiguration : IEntityTypeConfiguration<Budgets>
{
    public void Configure(EntityTypeBuilder<Budgets> builder)
    {
        builder.HasKey(e => e.Id).HasName("budgets_pkey");

            builder.ToTable("budgets", tb => tb.HasComment("Budget definitions per category."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.EndDate).HasColumnName("end_date");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.LimitAmount)
                .HasPrecision(15, 2)
                .HasColumnName("limit_amount");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.Period)
                .HasMaxLength(50)
                .HasColumnName("period");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Category).WithMany(p => p.Budgets)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("budgets_category_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.Budgets)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("budgets_household_id_fkey");
    }
}
