using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class ServiceProvidersConfiguration : IEntityTypeConfiguration<ServiceProviders>
{
    public void Configure(EntityTypeBuilder<ServiceProviders> builder)
    {
        builder.HasKey(e => e.Id).HasName("service_providers_pkey");

            builder.ToTable("service_providers", tb => tb.HasComment("Maintenance service providers. Shared resource across households."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AddressLine1)
                .HasMaxLength(255)
                .HasColumnName("address_line1");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            builder.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            builder.Property(e => e.Rating)
                .HasPrecision(2, 1)
                .HasColumnName("rating");
            builder.Property(e => e.State)
                .HasMaxLength(50)
                .HasColumnName("state");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            builder.Property(e => e.Website)
                .HasMaxLength(500)
                .HasColumnName("website");

            builder.HasOne(d => d.Category).WithMany(p => p.ServiceProviders)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("service_providers_category_id_fkey");
    }
}
