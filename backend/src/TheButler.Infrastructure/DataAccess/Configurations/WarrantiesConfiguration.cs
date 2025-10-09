using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class WarrantiesConfiguration : IEntityTypeConfiguration<Warranties>
{
    public void Configure(EntityTypeBuilder<Warranties> builder)
    {
        builder.HasKey(e => e.Id).HasName("warranties_pkey");

            builder.ToTable("warranties", tb => tb.HasComment("Warranty information for inventory items. Check is_active by querying WHERE end_date >= CURRENT_DATE."));

            builder.HasIndex(e => e.EndDate, "idx_warranties_end_date");

            builder.HasIndex(e => e.InventoryItemId, "idx_warranties_item");

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CoverageDetails).HasColumnName("coverage_details");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.DocumentUrl)
                .HasMaxLength(500)
                .HasColumnName("document_url");
            builder.Property(e => e.EndDate).HasColumnName("end_date");
            builder.Property(e => e.InventoryItemId).HasColumnName("inventory_item_id");
            builder.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            builder.Property(e => e.Provider)
                .HasMaxLength(200)
                .HasColumnName("provider");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.InventoryItem).WithMany(p => p.Warranties)
                .HasForeignKey(d => d.InventoryItemId)
                .HasConstraintName("warranties_inventory_item_id_fkey");
    }
}
