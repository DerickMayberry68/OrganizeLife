using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class AppointmentsConfiguration : IEntityTypeConfiguration<Appointments>
{
    public void Configure(EntityTypeBuilder<Appointments> builder)
    {
        builder.HasKey(e => e.Id).HasName("appointments_pkey");

        builder.ToTable("appointments", tb => tb.HasComment("Medical appointments for household members."));

        builder.HasIndex(e => e.HouseholdId, "idx_appointments_household");

        builder.HasIndex(e => e.HouseholdMemberId, "idx_appointments_member");

        builder.HasIndex(e => e.AppointmentDate, "idx_appointments_date");

        builder.HasIndex(e => e.Status, "idx_appointments_status");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.HouseholdMemberId).HasColumnName("household_member_id");
        builder.Property(e => e.ProviderId).HasColumnName("provider_id");
        builder.Property(e => e.AppointmentDate).HasColumnName("appointment_date");
        builder.Property(e => e.AppointmentTime).HasColumnName("appointment_time");
        builder.Property(e => e.AppointmentType)
            .HasMaxLength(100)
            .HasColumnName("appointment_type");
        builder.Property(e => e.Reason)
            .HasMaxLength(500)
            .HasColumnName("reason");
        builder.Property(e => e.Status)
            .HasMaxLength(50)
            .HasDefaultValueSql("'scheduled'::character varying")
            .HasColumnName("status");
        builder.Property(e => e.Location)
            .HasMaxLength(500)
            .HasColumnName("location");
        builder.Property(e => e.ProviderName)
            .HasMaxLength(200)
            .HasColumnName("provider_name");
        builder.Property(e => e.ReminderDays)
            .HasDefaultValue(1)
            .HasColumnName("reminder_days");
        builder.Property(e => e.ReminderEnabled)
            .HasDefaultValue(true)
            .HasColumnName("reminder_enabled");
        builder.Property(e => e.PrepInstructions).HasColumnName("prep_instructions");
        builder.Property(e => e.FollowUpNotes).HasColumnName("follow_up_notes");
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

        builder.HasOne(d => d.Household).WithMany(p => p.Appointments)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("appointments_household_id_fkey");

        builder.HasOne(d => d.HouseholdMember).WithMany(p => p.Appointments)
            .HasForeignKey(d => d.HouseholdMemberId)
            .HasConstraintName("appointments_household_member_id_fkey");

        builder.HasOne(d => d.Provider).WithMany(p => p.Appointments)
            .HasForeignKey(d => d.ProviderId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("appointments_provider_id_fkey");
    }
}

