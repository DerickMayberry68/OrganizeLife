using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class VaccinationsConfiguration : IEntityTypeConfiguration<Vaccinations>
{
    public void Configure(EntityTypeBuilder<Vaccinations> builder)
    {
        builder.HasKey(e => e.Id).HasName("vaccinations_pkey");

        builder.ToTable("vaccinations", tb => tb.HasComment("Vaccination and immunization records for household members."));

        builder.HasIndex(e => e.HouseholdId, "idx_vaccinations_household");

        builder.HasIndex(e => e.HouseholdMemberId, "idx_vaccinations_member");

        builder.HasIndex(e => e.DateAdministered, "idx_vaccinations_date");

        builder.HasIndex(e => e.VaccineName, "idx_vaccinations_vaccine_name");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.HouseholdMemberId).HasColumnName("household_member_id");
        builder.Property(e => e.ProviderId).HasColumnName("provider_id");
        builder.Property(e => e.VaccineName)
            .HasMaxLength(200)
            .HasColumnName("vaccine_name");
        builder.Property(e => e.DateAdministered).HasColumnName("date_administered");
        builder.Property(e => e.DoseNumber)
            .HasMaxLength(50)
            .HasColumnName("dose_number");
        builder.Property(e => e.LotNumber)
            .HasMaxLength(100)
            .HasColumnName("lot_number");
        builder.Property(e => e.Site)
            .HasMaxLength(100)
            .HasColumnName("site");
        builder.Property(e => e.Route)
            .HasMaxLength(100)
            .HasColumnName("route");
        builder.Property(e => e.NextDoseDate).HasColumnName("next_dose_date");
        builder.Property(e => e.IsUpToDate)
            .HasDefaultValue(true)
            .HasColumnName("is_up_to_date");
        builder.Property(e => e.AdministeredBy)
            .HasMaxLength(200)
            .HasColumnName("administered_by");
        builder.Property(e => e.Location)
            .HasMaxLength(500)
            .HasColumnName("location");
        builder.Property(e => e.Reactions).HasColumnName("reactions");
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

        builder.HasOne(d => d.Household).WithMany(p => p.Vaccinations)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("vaccinations_household_id_fkey");

        builder.HasOne(d => d.HouseholdMember).WithMany(p => p.Vaccinations)
            .HasForeignKey(d => d.HouseholdMemberId)
            .HasConstraintName("vaccinations_household_member_id_fkey");

        builder.HasOne(d => d.Provider).WithMany(p => p.Vaccinations)
            .HasForeignKey(d => d.ProviderId)
            .OnDelete(DeleteBehavior.SetNull)
            .HasConstraintName("vaccinations_provider_id_fkey");
    }
}

