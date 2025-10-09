using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class DocumentTagsConfiguration : IEntityTypeConfiguration<DocumentTags>
{
    public void Configure(EntityTypeBuilder<DocumentTags> builder)
    {
        builder.HasKey(e => new { e.DocumentId, e.Tag }).HasName("document_tags_pkey");

            builder.ToTable("document_tags", tb => tb.HasComment("Many-to-many tags for documents."));

            builder.HasIndex(e => e.Tag, "idx_document_tags_tag");

            builder.Property(e => e.DocumentId).HasColumnName("document_id");
            builder.Property(e => e.Tag)
                .HasMaxLength(50)
                .HasColumnName("tag");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");

            builder.HasOne(d => d.Document).WithMany(p => p.DocumentTags)
                .HasForeignKey(d => d.DocumentId)
                .HasConstraintName("document_tags_document_id_fkey");
    }
}
