using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class InsuranceTypesConfiguration : IEntityTypeConfiguration<InsuranceTypes>
{
    public void Configure(EntityTypeBuilder<InsuranceTypes> builder)
    {
        builder.HasKey(e => e.Id).HasName("insurance_types_pkey");

            builder.ToTable("insurance_types");

            builder.HasIndex(e => e.Name, "insurance_types_name_key").IsUnique();

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
    }
}
