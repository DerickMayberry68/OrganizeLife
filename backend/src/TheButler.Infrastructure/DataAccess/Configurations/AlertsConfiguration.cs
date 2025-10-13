using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations
{
    public class AlertsConfiguration : IEntityTypeConfiguration<Alerts>
    {
        public void Configure(EntityTypeBuilder<Alerts> builder)
        {
            builder.ToTable("alerts");

            // Primary Key
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            // Foreign Keys
            builder.Property(a => a.HouseholdId)
                .HasColumnName("household_id")
                .IsRequired();

            // Classification Properties
            builder.Property(a => a.Type)
                .HasColumnName("type")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(a => a.Category)
                .HasColumnName("category")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(a => a.Severity)
                .HasColumnName("severity")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(a => a.Priority)
                .HasColumnName("priority")
                .IsRequired();

            // Content Properties
            builder.Property(a => a.Title)
                .HasColumnName("title")
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(a => a.Message)
                .HasColumnName("message")
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(a => a.Description)
                .HasColumnName("description")
                .HasMaxLength(2000);

            // Related Entity Properties
            builder.Property(a => a.RelatedEntityType)
                .HasColumnName("related_entity_type")
                .HasMaxLength(100);

            builder.Property(a => a.RelatedEntityId)
                .HasColumnName("related_entity_id");

            builder.Property(a => a.RelatedEntityName)
                .HasColumnName("related_entity_name")
                .HasMaxLength(200);

            // Status & Timing Properties
            builder.Property(a => a.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(a => a.IsRead)
                .HasColumnName("is_read")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(a => a.IsDismissed)
                .HasColumnName("is_dismissed")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(a => a.CreatedAt)
                .HasColumnName("created_at")
                .IsRequired();

            builder.Property(a => a.ReadAt)
                .HasColumnName("read_at");

            builder.Property(a => a.DismissedAt)
                .HasColumnName("dismissed_at");

            builder.Property(a => a.ExpiresAt)
                .HasColumnName("expires_at");

            // Action Properties
            builder.Property(a => a.ActionUrl)
                .HasColumnName("action_url")
                .HasMaxLength(500);

            builder.Property(a => a.ActionLabel)
                .HasColumnName("action_label")
                .HasMaxLength(100);

            // Recurrence Properties
            builder.Property(a => a.IsRecurring)
                .HasColumnName("is_recurring")
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(a => a.RecurrenceRule)
                .HasColumnName("recurrence_rule")
                .HasMaxLength(100);

            builder.Property(a => a.NextOccurrence)
                .HasColumnName("next_occurrence");

            // Audit Properties
            builder.Property(a => a.UpdatedAt)
                .HasColumnName("updated_at");

            builder.Property(a => a.DeletedAt)
                .HasColumnName("deleted_at");

            // Relationships
            builder.HasOne(a => a.Household)
                .WithMany(h => h.Alerts)
                .HasForeignKey(a => a.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade);

            // Indexes for performance
            builder.HasIndex(a => a.HouseholdId)
                .HasDatabaseName("idx_alerts_household_id");

            builder.HasIndex(a => new { a.HouseholdId, a.IsRead })
                .HasDatabaseName("idx_alerts_household_isread");

            builder.HasIndex(a => new { a.HouseholdId, a.Category })
                .HasDatabaseName("idx_alerts_household_category");

            builder.HasIndex(a => new { a.HouseholdId, a.Severity })
                .HasDatabaseName("idx_alerts_household_severity");

            builder.HasIndex(a => a.CreatedAt)
                .HasDatabaseName("idx_alerts_created_at");

            builder.HasIndex(a => new { a.HouseholdId, a.Status })
                .HasDatabaseName("idx_alerts_household_status");

            // Soft delete filter
            builder.HasQueryFilter(a => a.DeletedAt == null);
        }
    }
}

