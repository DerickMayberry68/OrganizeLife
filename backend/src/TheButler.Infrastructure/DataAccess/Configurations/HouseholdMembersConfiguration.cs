using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class HouseholdMembersConfiguration : IEntityTypeConfiguration<HouseholdMembers>
{
    public void Configure(EntityTypeBuilder<HouseholdMembers> builder)
    {
        builder.HasKey(e => e.Id).HasName("household_members_pkey");

            builder.ToTable("household_members", tb => tb.HasComment("Links ASP.NET Identity users to households with role-based access."));

            builder.HasIndex(e => new { e.HouseholdId, e.UserId }, "household_members_household_id_user_id_key").IsUnique();

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.JoinedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("joined_at");
            builder.Property(e => e.Role)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Member'::character varying")
                .HasColumnName("role");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            builder.Property(e => e.UserId).HasColumnName("user_id");

            builder.HasOne(d => d.Household).WithMany(p => p.HouseholdMembers)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("household_members_household_id_fkey");
    }
}
