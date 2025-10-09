using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class InsuranceBeneficiariesConfiguration : IEntityTypeConfiguration<InsuranceBeneficiaries>
{
    public void Configure(EntityTypeBuilder<InsuranceBeneficiaries> builder)
    {
        builder.HasKey(e => e.Id).HasName("insurance_beneficiaries_pkey");

            builder.ToTable("insurance_beneficiaries", tb => tb.HasComment("Beneficiaries for insurance policies."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.ContactInfo).HasColumnName("contact_info");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.InsurancePolicyId).HasColumnName("insurance_policy_id");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.Percentage)
                .HasPrecision(5, 2)
                .HasColumnName("percentage");
            builder.Property(e => e.Relationship)
                .HasMaxLength(100)
                .HasColumnName("relationship");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.InsurancePolicy).WithMany(p => p.InsuranceBeneficiaries)
                .HasForeignKey(d => d.InsurancePolicyId)
                .HasConstraintName("insurance_beneficiaries_insurance_policy_id_fkey");
    }
}
