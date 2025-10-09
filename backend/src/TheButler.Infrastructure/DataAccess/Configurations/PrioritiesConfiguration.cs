using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class PrioritiesConfiguration : IEntityTypeConfiguration<Priorities>
{
    public void Configure(EntityTypeBuilder<Priorities> builder)
    {
        builder.HasKey(e => e.Id).HasName("priorities_pkey");

            builder.ToTable("priorities");

            builder.HasIndex(e => e.Name, "priorities_name_key").IsUnique();

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            builder.Property(e => e.SortOrder).HasColumnName("sort_order");
    }
}
