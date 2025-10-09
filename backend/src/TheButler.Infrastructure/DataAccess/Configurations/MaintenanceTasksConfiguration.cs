using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class MaintenanceTasksConfiguration : IEntityTypeConfiguration<MaintenanceTasks>
{
    public void Configure(EntityTypeBuilder<MaintenanceTasks> builder)
    {
        builder.HasKey(e => e.Id).HasName("maintenance_tasks_pkey");

            builder.ToTable("maintenance_tasks", tb => tb.HasComment("Home maintenance tasks and schedules."));

            builder.HasIndex(e => e.DueDate, "idx_maintenance_due_date");

            builder.HasIndex(e => e.HouseholdId, "idx_maintenance_household");

            builder.HasIndex(e => e.Status, "idx_maintenance_status");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.ActualCost)
                .HasPrecision(10, 2)
                .HasColumnName("actual_cost");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CompletedDate).HasColumnName("completed_date");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.DueDate).HasColumnName("due_date");
            builder.Property(e => e.EstimatedCost)
                .HasPrecision(10, 2)
                .HasColumnName("estimated_cost");
            builder.Property(e => e.FrequencyId).HasColumnName("frequency_id");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsRecurring)
                .HasDefaultValue(false)
                .HasColumnName("is_recurring");
            builder.Property(e => e.Location)
                .HasMaxLength(200)
                .HasColumnName("location");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.PriorityId).HasColumnName("priority_id");
            builder.Property(e => e.ServiceProviderId).HasColumnName("service_provider_id");
            builder.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'pending'::character varying")
                .HasColumnName("status");
            builder.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Category).WithMany(p => p.MaintenanceTasks)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("maintenance_tasks_category_id_fkey");

            builder.HasOne(d => d.Frequency).WithMany(p => p.MaintenanceTasks)
                .HasForeignKey(d => d.FrequencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("maintenance_tasks_frequency_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.MaintenanceTasks)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("maintenance_tasks_household_id_fkey");

            builder.HasOne(d => d.Priority).WithMany(p => p.MaintenanceTasks)
                .HasForeignKey(d => d.PriorityId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("maintenance_tasks_priority_id_fkey");

            builder.HasOne(d => d.ServiceProvider).WithMany(p => p.MaintenanceTasks)
                .HasForeignKey(d => d.ServiceProviderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("maintenance_tasks_service_provider_id_fkey");
    }
}
