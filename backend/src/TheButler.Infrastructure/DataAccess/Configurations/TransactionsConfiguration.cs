using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class TransactionsConfiguration : IEntityTypeConfiguration<Transactions>
{
    public void Configure(EntityTypeBuilder<Transactions> builder)
    {
        builder.HasKey(e => e.Id).HasName("transactions_pkey");

            builder.ToTable("transactions", tb => tb.HasComment("All financial transactions. Links to accounts and categories."));

            builder.HasIndex(e => e.AccountId, "idx_transactions_account");

            builder.HasIndex(e => e.CategoryId, "idx_transactions_category");

            builder.HasIndex(e => e.Date, "idx_transactions_date");

            builder.HasIndex(e => e.HouseholdId, "idx_transactions_household");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AccountId).HasColumnName("account_id");
            builder.Property(e => e.Amount)
                .HasPrecision(15, 2)
                .HasColumnName("amount");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.Date).HasColumnName("date");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsRecurring)
                .HasDefaultValue(false)
                .HasColumnName("is_recurring");
            builder.Property(e => e.MerchantName)
                .HasMaxLength(200)
                .HasColumnName("merchant_name");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.ParentTransactionId).HasColumnName("parent_transaction_id");
            builder.Property(e => e.PlaidTransactionId)
                .HasMaxLength(255)
                .HasColumnName("plaid_transaction_id");
            builder.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Account).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("transactions_account_id_fkey");

            builder.HasOne(d => d.Category).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_category_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("transactions_household_id_fkey");

            builder.HasOne(d => d.ParentTransaction).WithMany(p => p.InverseParentTransaction)
                .HasForeignKey(d => d.ParentTransactionId)
                .HasConstraintName("transactions_parent_transaction_id_fkey");
    }
}
