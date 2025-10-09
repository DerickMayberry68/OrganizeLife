using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class SubscriptionsConfiguration : IEntityTypeConfiguration<Subscriptions>
{
    public void Configure(EntityTypeBuilder<Subscriptions> builder)
    {
        builder.HasKey(e => e.Id).HasName("subscriptions_pkey");

            builder.ToTable("subscriptions", tb => tb.HasComment("Recurring subscriptions (streaming, software, etc.). Links to accounts."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AccountId).HasColumnName("account_id");
            builder.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            builder.Property(e => e.AutoRenew)
                .HasDefaultValue(true)
                .HasColumnName("auto_renew");
            builder.Property(e => e.BillingCycleId).HasColumnName("billing_cycle_id");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.MerchantWebsite)
                .HasMaxLength(500)
                .HasColumnName("merchant_website");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.NextBillingDate).HasColumnName("next_billing_date");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Account).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("subscriptions_account_id_fkey");

            builder.HasOne(d => d.BillingCycle).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.BillingCycleId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("subscriptions_billing_cycle_id_fkey");

            builder.HasOne(d => d.Category).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("subscriptions_category_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("subscriptions_household_id_fkey");
    }
}
