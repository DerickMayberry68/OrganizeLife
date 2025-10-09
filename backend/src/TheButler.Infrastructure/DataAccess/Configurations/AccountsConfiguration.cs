using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class AccountsConfiguration : IEntityTypeConfiguration<Accounts>
{
    public void Configure(EntityTypeBuilder<Accounts> builder)
    {
        builder.HasKey(e => e.Id).HasName("accounts_pkey");

            builder.ToTable("accounts", tb => tb.HasComment("Financial accounts (checking, savings, credit cards, investments)."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AccountNumberLast4)
                .HasMaxLength(4)
                .HasColumnName("account_number_last4");
            builder.Property(e => e.Balance)
                .HasPrecision(15, 2)
                .HasDefaultValueSql("0.00")
                .HasColumnName("balance");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.Currency)
                .HasMaxLength(3)
                .HasDefaultValueSql("'USD'::character varying")
                .HasColumnName("currency");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.Institution)
                .HasMaxLength(200)
                .HasColumnName("institution");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.LastSyncedAt).HasColumnName("last_synced_at");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.PlaidAccountId)
                .HasMaxLength(255)
                .HasColumnName("plaid_account_id");
            builder.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Household).WithMany(p => p.Accounts)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("accounts_household_id_fkey");
    }
}
