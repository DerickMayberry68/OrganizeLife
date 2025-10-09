using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class NotificationsConfiguration : IEntityTypeConfiguration<Notifications>
{
    public void Configure(EntityTypeBuilder<Notifications> builder)
    {
        builder.HasKey(e => e.Id).HasName("notifications_pkey");

            builder.ToTable("notifications", tb => tb.HasComment("User notifications for bills, maintenance, expiring documents, etc."));

            builder.HasIndex(e => e.CreatedAt, "idx_notifications_created");

            builder.HasIndex(e => new { e.UserId, e.IsRead }, "idx_notifications_user");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.ActionUrl)
                .HasMaxLength(500)
                .HasColumnName("action_url");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            builder.Property(e => e.Message).HasColumnName("message");
            builder.Property(e => e.ReadAt).HasColumnName("read_at");
            builder.Property(e => e.RelatedEntityId).HasColumnName("related_entity_id");
            builder.Property(e => e.RelatedEntityType)
                .HasMaxLength(100)
                .HasColumnName("related_entity_type");
            builder.Property(e => e.Severity)
                .HasMaxLength(50)
                .HasDefaultValueSql("'info'::character varying")
                .HasColumnName("severity");
            builder.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            builder.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            builder.Property(e => e.UserId).HasColumnName("user_id");

            builder.HasOne(d => d.Household).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.HouseholdId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("notifications_household_id_fkey");
    }
}
