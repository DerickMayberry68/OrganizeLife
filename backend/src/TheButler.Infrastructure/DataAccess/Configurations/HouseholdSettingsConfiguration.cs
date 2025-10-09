using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class HouseholdSettingsConfiguration : IEntityTypeConfiguration<HouseholdSettings>
{
    public void Configure(EntityTypeBuilder<HouseholdSettings> builder)
    {
        builder.HasKey(e => e.Id).HasName("household_settings_pkey");

            builder.ToTable("household_settings", tb => tb.HasComment("Key-value store for household preferences and settings."));

            builder.HasIndex(e => new { e.HouseholdId, e.SettingKey }, "household_settings_household_id_setting_key_key").IsUnique();

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DataType)
                .HasMaxLength(50)
                .HasDefaultValueSql("'string'::character varying")
                .HasColumnName("data_type");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.SettingKey)
                .HasMaxLength(100)
                .HasColumnName("setting_key");
            builder.Property(e => e.SettingValue).HasColumnName("setting_value");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Household).WithMany(p => p.HouseholdSettings)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("household_settings_household_id_fkey");
    }
}
