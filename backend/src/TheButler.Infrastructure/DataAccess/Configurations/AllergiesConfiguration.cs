using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class AllergiesConfiguration : IEntityTypeConfiguration<Allergies>
{
    public void Configure(EntityTypeBuilder<Allergies> builder)
    {
        builder.HasKey(e => e.Id).HasName("allergies_pkey");

        builder.ToTable("allergies", tb => tb.HasComment("Allergy information for household members."));

        builder.HasIndex(e => e.HouseholdId, "idx_allergies_household");

        builder.HasIndex(e => e.HouseholdMemberId, "idx_allergies_member");

        builder.HasIndex(e => e.AllergyType, "idx_allergies_type");

        builder.HasIndex(e => e.Severity, "idx_allergies_severity");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.HouseholdMemberId).HasColumnName("household_member_id");
        builder.Property(e => e.AllergyType)
            .HasMaxLength(100)
            .HasColumnName("allergy_type");
        builder.Property(e => e.Allergen)
            .HasMaxLength(200)
            .HasColumnName("allergen");
        builder.Property(e => e.Severity)
            .HasMaxLength(50)
            .HasColumnName("severity");
        builder.Property(e => e.Reaction).HasColumnName("reaction");
        builder.Property(e => e.DiagnosedDate).HasColumnName("diagnosed_date");
        builder.Property(e => e.Treatment)
            .HasMaxLength(500)
            .HasColumnName("treatment");
        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");
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

        builder.HasOne(d => d.Household).WithMany(p => p.Allergies)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("allergies_household_id_fkey");

        builder.HasOne(d => d.HouseholdMember).WithMany(p => p.Allergies)
            .HasForeignKey(d => d.HouseholdMemberId)
            .HasConstraintName("allergies_household_member_id_fkey");
    }
}

