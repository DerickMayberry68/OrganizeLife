using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class BillsConfiguration : IEntityTypeConfiguration<Bills>
{
    public void Configure(EntityTypeBuilder<Bills> builder)
    {
        builder.HasKey(e => e.Id).HasName("bills_pkey");

            builder.ToTable("bills", tb => tb.HasComment("Bills to be paid. Can be one-time or recurring."));

            builder.HasIndex(e => e.DueDate, "idx_bills_due_date");

            builder.HasIndex(e => e.HouseholdId, "idx_bills_household");

            builder.HasIndex(e => e.Status, "idx_bills_status");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.AccountId).HasColumnName("account_id");
            builder.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            builder.Property(e => e.AutoPayEnabled)
                .HasDefaultValue(false)
                .HasColumnName("auto_pay_enabled");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.DueDate).HasColumnName("due_date");
            builder.Property(e => e.FrequencyId).HasColumnName("frequency_id");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsRecurring)
                .HasDefaultValue(false)
                .HasColumnName("is_recurring");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.PayeeAccountNumber)
                .HasMaxLength(100)
                .HasColumnName("payee_account_number");
            builder.Property(e => e.PayeeName)
                .HasMaxLength(200)
                .HasColumnName("payee_name");
            builder.Property(e => e.PaymentMethod)
                .HasMaxLength(100)
                .HasColumnName("payment_method");
            builder.Property(e => e.ReminderDays)
                .HasDefaultValue(3)
                .HasColumnName("reminder_days");
            builder.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'pending'::character varying")
                .HasColumnName("status");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Account).WithMany(p => p.Bills)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bills_account_id_fkey");

            builder.HasOne(d => d.Category).WithMany(p => p.Bills)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bills_category_id_fkey");

            builder.HasOne(d => d.Frequency).WithMany(p => p.Bills)
                .HasForeignKey(d => d.FrequencyId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("bills_frequency_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.Bills)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("bills_household_id_fkey");
    }
}
