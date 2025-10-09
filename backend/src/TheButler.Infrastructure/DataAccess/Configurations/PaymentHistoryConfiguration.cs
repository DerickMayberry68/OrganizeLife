using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class PaymentHistoryConfiguration : IEntityTypeConfiguration<PaymentHistory>
{
    public void Configure(EntityTypeBuilder<PaymentHistory> builder)
    {
        builder.HasKey(e => e.Id).HasName("payment_history_pkey");

            builder.ToTable("payment_history", tb => tb.HasComment("Historical record of bill payments. Links to transactions."));

            builder.HasIndex(e => e.BillId, "idx_payment_history_bill");

            builder.HasIndex(e => e.PaidDate, "idx_payment_history_date");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            builder.Property(e => e.BillId).HasColumnName("bill_id");
            builder.Property(e => e.ConfirmationNumber)
                .HasMaxLength(100)
                .HasColumnName("confirmation_number");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.PaidDate).HasColumnName("paid_date");
            builder.Property(e => e.PaymentMethod)
                .HasMaxLength(100)
                .HasColumnName("payment_method");
            builder.Property(e => e.TransactionId).HasColumnName("transaction_id");

            builder.HasOne(d => d.Bill).WithMany(p => p.PaymentHistory)
                .HasForeignKey(d => d.BillId)
                .HasConstraintName("payment_history_bill_id_fkey");

            builder.HasOne(d => d.Transaction).WithMany(p => p.PaymentHistory)
                .HasForeignKey(d => d.TransactionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("payment_history_transaction_id_fkey");
    }
}
