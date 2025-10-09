using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class RemindersConfiguration : IEntityTypeConfiguration<Reminders>
{
    public void Configure(EntityTypeBuilder<Reminders> builder)
    {
        builder.HasKey(e => e.Id).HasName("reminders_pkey");

            builder.ToTable("reminders", tb => tb.HasComment("Scheduled reminders for upcoming events."));

            builder.HasIndex(e => e.RemindAt, "idx_reminders_remind_at").HasFilter("((is_sent = false) AND (is_active = true))");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.IsSent)
                .HasDefaultValue(false)
                .HasColumnName("is_sent");
            builder.Property(e => e.RecurrencePattern)
                .HasMaxLength(100)
                .HasColumnName("recurrence_pattern");
            builder.Property(e => e.RelatedEntityId).HasColumnName("related_entity_id");
            builder.Property(e => e.RelatedEntityType)
                .HasMaxLength(100)
                .HasColumnName("related_entity_type");
            builder.Property(e => e.RemindAt).HasColumnName("remind_at");
            builder.Property(e => e.ReminderType)
                .HasMaxLength(50)
                .HasColumnName("reminder_type");
            builder.Property(e => e.SentAt).HasColumnName("sent_at");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            builder.Property(e => e.UserId).HasColumnName("user_id");

            builder.HasOne(d => d.Household).WithMany(p => p.Reminders)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("reminders_household_id_fkey");
    }
}
