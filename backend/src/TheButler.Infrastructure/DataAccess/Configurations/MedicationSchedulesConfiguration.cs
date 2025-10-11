using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class MedicationSchedulesConfiguration : IEntityTypeConfiguration<MedicationSchedules>
{
    public void Configure(EntityTypeBuilder<MedicationSchedules> builder)
    {
        builder.HasKey(e => e.Id).HasName("medication_schedules_pkey");

        builder.ToTable("medication_schedules", tb => tb.HasComment("Medication schedules and reminders for when to take medications."));

        builder.HasIndex(e => e.MedicationId, "idx_medication_schedules_medication");

        builder.HasIndex(e => e.IsActive, "idx_medication_schedules_active");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.MedicationId).HasColumnName("medication_id");
        builder.Property(e => e.ScheduledTime).HasColumnName("scheduled_time");
        builder.Property(e => e.DayOfWeek)
            .HasMaxLength(50)
            .HasColumnName("day_of_week");
        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");
        builder.Property(e => e.ReminderEnabled)
            .HasDefaultValue(true)
            .HasColumnName("reminder_enabled");
        builder.Property(e => e.ReminderMinutesBefore)
            .HasDefaultValue(30)
            .HasColumnName("reminder_minutes_before");
        builder.Property(e => e.Notes).HasColumnName("notes");
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");
        builder.Property(e => e.CreatedBy).HasColumnName("created_by");
        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("updated_at");
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
        builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");

        builder.HasOne(d => d.Medication).WithMany(p => p.MedicationSchedules)
            .HasForeignKey(d => d.MedicationId)
            .HasConstraintName("medication_schedules_medication_id_fkey");
    }
}

