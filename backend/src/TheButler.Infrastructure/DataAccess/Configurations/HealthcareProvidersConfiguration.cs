using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class HealthcareProvidersConfiguration : IEntityTypeConfiguration<HealthcareProviders>
{
    public void Configure(EntityTypeBuilder<HealthcareProviders> builder)
    {
        builder.HasKey(e => e.Id).HasName("healthcare_providers_pkey");

        builder.ToTable("healthcare_providers", tb => tb.HasComment("Healthcare providers (doctors, clinics, hospitals, specialists, etc.)."));

        builder.HasIndex(e => e.HouseholdId, "idx_healthcare_providers_household");

        builder.HasIndex(e => e.ProviderType, "idx_healthcare_providers_type");

        builder.HasIndex(e => e.Specialty, "idx_healthcare_providers_specialty");

        builder.Property(e => e.Id)
            .HasDefaultValueSql("uuid_generate_v4()")
            .HasColumnName("id");
        builder.Property(e => e.HouseholdId).HasColumnName("household_id");
        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .HasColumnName("name");
        builder.Property(e => e.ProviderType)
            .HasMaxLength(100)
            .HasColumnName("provider_type");
        builder.Property(e => e.Specialty)
            .HasMaxLength(200)
            .HasColumnName("specialty");
        builder.Property(e => e.PhoneNumber)
            .HasMaxLength(50)
            .HasColumnName("phone_number");
        builder.Property(e => e.Email)
            .HasMaxLength(200)
            .HasColumnName("email");
        builder.Property(e => e.Website)
            .HasMaxLength(500)
            .HasColumnName("website");
        builder.Property(e => e.AddressLine1)
            .HasMaxLength(200)
            .HasColumnName("address_line1");
        builder.Property(e => e.AddressLine2)
            .HasMaxLength(200)
            .HasColumnName("address_line2");
        builder.Property(e => e.City)
            .HasMaxLength(100)
            .HasColumnName("city");
        builder.Property(e => e.State)
            .HasMaxLength(100)
            .HasColumnName("state");
        builder.Property(e => e.PostalCode)
            .HasMaxLength(20)
            .HasColumnName("postal_code");
        builder.Property(e => e.Country)
            .HasMaxLength(100)
            .HasColumnName("country");
        builder.Property(e => e.Notes).HasColumnName("notes");
        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .HasColumnName("is_active");
        builder.Property(e => e.CreatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("created_at");
        builder.Property(e => e.CreatedBy).HasColumnName("created_by");
        builder.Property(e => e.UpdatedAt)
            .HasDefaultValueSql("now()")
            .HasColumnName("updated_at");
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
        builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");

        builder.HasOne(d => d.Household).WithMany(p => p.HealthcareProviders)
            .HasForeignKey(d => d.HouseholdId)
            .HasConstraintName("healthcare_providers_household_id_fkey");
    }
}

