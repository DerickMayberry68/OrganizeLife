using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class ActivityLogsConfiguration : IEntityTypeConfiguration<ActivityLogs>
{
    public void Configure(EntityTypeBuilder<ActivityLogs> builder)
    {
        builder.HasKey(e => e.Id).HasName("activity_logs_pkey");

            builder.ToTable("activity_logs", tb => tb.HasComment("Audit trail of all user actions in the system."));

            builder.HasIndex(e => e.CreatedAt, "idx_activity_logs_created");

            builder.HasIndex(e => new { e.EntityType, e.EntityId }, "idx_activity_logs_entity");

            builder.HasIndex(e => e.HouseholdId, "idx_activity_logs_household");

            builder.HasIndex(e => e.UserId, "idx_activity_logs_user");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.Action)
                .HasMaxLength(100)
                .HasColumnName("action");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.EntityId).HasColumnName("entity_id");
            builder.Property(e => e.EntityName)
                .HasMaxLength(200)
                .HasColumnName("entity_name");
            builder.Property(e => e.EntityType)
                .HasMaxLength(100)
                .HasColumnName("entity_type");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IpAddress).HasColumnName("ip_address");
            builder.Property(e => e.Metadata)
                .HasColumnType("jsonb")
                .HasColumnName("metadata");
            builder.Property(e => e.UserAgent).HasColumnName("user_agent");
            builder.Property(e => e.UserId).HasColumnName("user_id");

            builder.HasOne(d => d.Household).WithMany(p => p.ActivityLogs)
                .HasForeignKey(d => d.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("activity_logs_household_id_fkey");
    }
}
