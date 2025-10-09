using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.DataAccess.Configurations;

public class InventoryItemsConfiguration : IEntityTypeConfiguration<InventoryItems>
{
    public void Configure(EntityTypeBuilder<InventoryItems> builder)
    {
        builder.HasKey(e => e.Id).HasName("inventory_items_pkey");

            builder.ToTable("inventory_items", tb => tb.HasComment("Household items with purchase info, location, and photos."));

            builder.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            builder.Property(e => e.CreatedBy).HasColumnName("created_by");
            builder.Property(e => e.CurrentValue)
                .HasPrecision(10, 2)
                .HasColumnName("current_value");
            builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.HouseholdId).HasColumnName("household_id");
            builder.Property(e => e.Location)
                .HasMaxLength(200)
                .HasColumnName("location");
            builder.Property(e => e.Manufacturer)
                .HasMaxLength(100)
                .HasColumnName("manufacturer");
            builder.Property(e => e.ModelNumber)
                .HasMaxLength(100)
                .HasColumnName("model_number");
            builder.Property(e => e.Name)
                .HasMaxLength(200)
                .HasColumnName("name");
            builder.Property(e => e.Notes).HasColumnName("notes");
            builder.Property(e => e.PhotoUrls).HasColumnName("photo_urls");
            builder.Property(e => e.PurchaseDate).HasColumnName("purchase_date");
            builder.Property(e => e.PurchasePrice)
                .HasPrecision(10, 2)
                .HasColumnName("purchase_price");
            builder.Property(e => e.SerialNumber)
                .HasMaxLength(100)
                .HasColumnName("serial_number");
            builder.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("updated_at");
            builder.Property(e => e.UpdatedBy).HasColumnName("updated_by");

            builder.HasOne(d => d.Category).WithMany(p => p.InventoryItems)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("inventory_items_category_id_fkey");

            builder.HasOne(d => d.Household).WithMany(p => p.InventoryItems)
                .HasForeignKey(d => d.HouseholdId)
                .HasConstraintName("inventory_items_household_id_fkey");
    }
}
