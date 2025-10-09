using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class DocumentsConfiguration : IEntityTypeConfiguration<Documents>
{
    public void Configure(EntityTypeBuilder<Documents> builder)
    {
        builder.HasKey(e => e.Id).HasName("documents_pkey");

            builder.ToTable("documents", tb => tb.HasComment("Document vault for important files. Stores file paths, not binary data."));

            builder.HasIndex(e => e.ExpiryDate, "idx_documents_expiry").HasFilter("(expiry_date IS NOT NULL)");

            builder.HasIndex(e => e.HouseholdId, "idx_documents_household");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.ExpiryDate).HasColumnName("expiry_date");
            builder.Property(e => e.FileName)
                .HasMaxLength(255)
                .HasColumnName("file_name");
            builder.Property(e => e.FilePath)
                .HasMaxLength(500)
                .HasColumnName("file_path");
            builder.Property(e => e.FileSizeBytes).HasColumnName("file_size_bytes");
            builder.Property(e => e.FileType)
                .HasMaxLength(50)
                .HasColumnName("file_type");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.IsArchived)
                .HasDefaultValue(false)
                .HasColumnName("is_archived");
            builder.Property(e => e.IsImportant)
                .HasDefaultValue(false)
                .HasColumnName("is_important");
            builder.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");
            builder.Property(e => e.UploadDate)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("upload_date");

            builder.HasOne(d => d.Category).WithMany(p => p.Documents)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("documents_category_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.Documents)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("documents_household_id_fkey");
    }
}
