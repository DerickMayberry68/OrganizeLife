using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class ItemMaintenanceSchedulesConfiguration : IEntityTypeConfiguration<ItemMaintenanceSchedules>
{
    public void Configure(EntityTypeBuilder<ItemMaintenanceSchedules> builder)
    {
        builder.HasKey(e => e.Id).HasName("item_maintenance_schedules_pkey");

            builder.ToTable("item_maintenance_schedules", tb => tb.HasComment("Recurring maintenance schedules for specific items."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.FrequencyId).HasColumnName("frequency_id");
            builder.Property(e => e.InventoryItemId).HasColumnName("inventory_item_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.LastCompleted).HasColumnName("last_completed");
            builder.Property(e => e.NextDue).HasColumnName("next_due");
            builder.Property(e => e.Task)
                .HasMaxLength(200)
                .HasColumnName("task");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Frequency).WithMany(p => p.ItemMaintenanceSchedules)
                .HasForeignKey(d => d.FrequencyId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("item_maintenance_schedules_frequency_id_fkey");

            builder.HasOne(d => d.InventoryItem).WithMany(p => p.ItemMaintenanceSchedules)
                .HasForeignKey(d => d.InventoryItemId)
                .HasConstraintName("item_maintenance_schedules_inventory_item_id_fkey");
    }
}
