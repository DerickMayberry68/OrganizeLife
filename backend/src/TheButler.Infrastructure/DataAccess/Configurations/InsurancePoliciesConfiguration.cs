using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class InsurancePoliciesConfiguration : IEntityTypeConfiguration<InsurancePolicies>
{
    public void Configure(EntityTypeBuilder<InsurancePolicies> builder)
    {
        builder.HasKey(e => e.Id).HasName("insurance_policies_pkey");

            builder.ToTable("insurance_policies", tb => tb.HasComment("Insurance policies (home, auto, health, life, etc.)."));

            builder.HasIndex(e => e.HouseholdId, "idx_insurance_household");

            builder.HasIndex(e => e.RenewalDate, "idx_insurance_renewal");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.BillingFrequencyId).HasColumnName("billing_frequency_id");
            builder.Property(e => e.CoverageAmount)
                .HasPrecision(15, 2)
                .HasColumnName("coverage_amount");
            builder.Property(e => e.CoverageDetails).HasColumnName("coverage_details");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.Deductible)
                .HasPrecision(10, 2)
                .HasColumnName("deductible");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.DocumentUrl)
                .HasMaxLength(500)
                .HasColumnName("document_url");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.InsuranceTypeId).HasColumnName("insurance_type_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.PolicyNumber)
                .HasMaxLength(100)
                .HasColumnName("policy_number");
            builder.Property(e => e.Premium)
                .HasPrecision(10, 2)
                .HasColumnName("premium");
            builder.Property(e => e.Provider)
                .HasMaxLength(200)
                .HasColumnName("provider");
            builder.Property(e => e.RenewalDate).HasColumnName("renewal_date");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.BillingFrequency).WithMany(p => p.InsurancePolicies)
                .HasForeignKey(d => d.BillingFrequencyId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("insurance_policies_billing_frequency_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.InsurancePolicies)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("insurance_policies_household_id_fkey");

            builder.HasOne(d => d.InsuranceType).WithMany(p => p.InsurancePolicies)
                .HasForeignKey(d => d.InsuranceTypeId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("insurance_policies_insurance_type_id_fkey");
    }
}
