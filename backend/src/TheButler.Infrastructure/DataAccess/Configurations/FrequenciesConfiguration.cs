using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class FrequenciesConfiguration : IEntityTypeConfiguration<Frequencies>
{
    public void Configure(EntityTypeBuilder<Frequencies> builder)
    {
        builder.HasKey(e => e.Id).HasName("frequencies_pkey");

            builder.ToTable("frequencies");

            builder.HasIndex(e => e.Name, "frequencies_name_key").IsUnique();

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.IntervalDays).HasColumnName("interval_days");
            builder.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
    }
}
