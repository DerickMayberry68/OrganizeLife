using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class MedicalRecordsConfiguration : IEntityTypeConfiguration<MedicalRecords>
{
    public void Configure(EntityTypeBuilder<MedicalRecords> builder)
    {
        builder.HasKey(e => e.Id).HasName("medical_records_pkey");

        builder.ToTable("medical_records", tb => tb.HasComment("Medical records and health history for household members."));

        builder.HasIndex(e => e.HouseholdId, "idx_medical_records_household");

        builder.HasIndex(e => e.HouseholdMemberId, "idx_medical_records_member");

        builder.HasIndex(e => e.RecordDate, "idx_medical_records_date");

        builder.HasIndex(e => e.RecordType, "idx_medical_records_type");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.HouseholdMemberId).HasColumnName("household_member_id");
        builder.Property(e => e.ProviderId).HasColumnName("provider_id");
        builder.Property(e => e.RecordDate).HasColumnName("record_date");
        builder.Property(e => e.RecordType)
            .HasMaxLength(100)
            .HasColumnName("record_type");
        builder.Property(e => e.Diagnosis).HasColumnName("diagnosis");
        builder.Property(e => e.Treatment).HasColumnName("treatment");
        builder.Property(e => e.Medications).HasColumnName("medications");
        builder.Property(e => e.TestResults).HasColumnName("test_results");
        builder.Property(e => e.FollowUpInstructions).HasColumnName("follow_up_instructions");
        builder.Property(e => e.FollowUpDate).HasColumnName("follow_up_date");
        builder.Property(e => e.DocumentUrl)
            .HasMaxLength(500)
            .HasColumnName("document_url");
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

        builder.HasOne(d => d.Household).WithMany(p => p.MedicalRecords)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("medical_records_household_id_fkey");

        builder.HasOne(d => d.HouseholdMember).WithMany(p => p.MedicalRecords)
            .HasForeignKey(d => d.HouseholdMemberId)
            .HasConstraintName("medical_records_household_member_id_fkey");

        builder.HasOne(d => d.Provider).WithMany(p => p.MedicalRecords)
            .HasForeignKey(d => d.ProviderId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("medical_records_provider_id_fkey");
    }
}

