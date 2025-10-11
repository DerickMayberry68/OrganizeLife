using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class MedicationsConfiguration : IEntityTypeConfiguration<Medications>
{
    public void Configure(EntityTypeBuilder<Medications> builder)
    {
        builder.HasKey(e => e.Id).HasName("medications_pkey");

        builder.ToTable("medications", tb => tb.HasComment("Prescription and over-the-counter medications for household members."));

        builder.HasIndex(e => e.HouseholdId, "idx_medications_household");

        builder.HasIndex(e => e.HouseholdMemberId, "idx_medications_member");

        builder.HasIndex(e => e.IsActive, "idx_medications_active");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.HouseholdMemberId).HasColumnName("household_member_id");
        builder.Property(e => e.ProviderId).HasColumnName("provider_id");
        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .HasColumnName("name");
        builder.Property(e => e.GenericName)
            .HasMaxLength(200)
            .HasColumnName("generic_name");
        builder.Property(e => e.Dosage)
            .HasMaxLength(100)
            .HasColumnName("dosage");
        builder.Property(e => e.Frequency)
            .HasMaxLength(100)
            .HasColumnName("frequency");
        builder.Property(e => e.Route)
            .HasMaxLength(100)
            .HasColumnName("route");
        builder.Property(e => e.Reason)
            .HasMaxLength(500)
            .HasColumnName("reason");
        builder.Property(e => e.StartDate).HasColumnName("start_date");
        builder.Property(e => e.EndDate).HasColumnName("end_date");
        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");
        builder.Property(e => e.IsPrescription)
            .HasDefaultValue(false)
            .HasColumnName("is_prescription");
        builder.Property(e => e.PrescriptionNumber)
            .HasMaxLength(100)
            .HasColumnName("prescription_number");
        builder.Property(e => e.RefillsRemaining).HasColumnName("refills_remaining");
        builder.Property(e => e.Pharmacy)
            .HasMaxLength(200)
            .HasColumnName("pharmacy");
        builder.Property(e => e.PharmacyPhone)
            .HasMaxLength(50)
            .HasColumnName("pharmacy_phone");
        builder.Property(e => e.SideEffects).HasColumnName("side_effects");
        builder.Property(e => e.Instructions).HasColumnName("instructions");
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

        builder.HasOne(d => d.Household).WithMany(p => p.Medications)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("medications_household_id_fkey");

        builder.HasOne(d => d.HouseholdMember).WithMany(p => p.Medications)
            .HasForeignKey(d => d.HouseholdMemberId)
            .HasConstraintName("medications_household_member_id_fkey");

        builder.HasOne(d => d.Provider).WithMany(p => p.Medications)
            .HasForeignKey(d => d.ProviderId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("medications_provider_id_fkey");
    }
}

