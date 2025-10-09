using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class HouseholdsConfiguration : IEntityTypeConfiguration<Households>
{
    public void Configure(EntityTypeBuilder<Households> builder)
    {
        builder.HasKey(e => e.Id).HasName("households_pkey");

            builder.ToTable("households", tb => tb.HasComment("Main organizational unit for TheButler app. All data is scoped to a household."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AddressLine1)
                .HasMaxLength(255)
                .HasColumnName("address_line1");
            builder.Property(e => e.AddressLine2)
                .HasMaxLength(255)
                .HasColumnName("address_line2");
            builder.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            builder.Property(e => e.Country)
                .HasMaxLength(100)
                .HasDefaultValueSql("'USA'::character varying")
                .HasColumnName("country");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.PostalCode)
                .HasMaxLength(20)
                .HasColumnName("postal_code");
            builder.Property(e => e.State)
                .HasMaxLength(50)
                .HasColumnName("state");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
    }
}
