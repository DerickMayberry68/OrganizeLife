using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Household items with purchase info, location, and photos.
/// </summary>
public partial class InventoryItems
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid? CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly PurchaseDate { get; set; }

    public decimal PurchasePrice { get; set; }

    public decimal? CurrentValue { get; set; }

    public string Location { get; set; } = null!;

    public string? SerialNumber { get; set; }

    public string? ModelNumber { get; set; }

    public string? Manufacturer { get; set; }

    public string? Notes { get; set; }

    public List<string>? PhotoUrls { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Categories? Category { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<ItemMaintenanceSchedules> ItemMaintenanceSchedules { get; set; } = new List<ItemMaintenanceSchedules>();

    public virtual ICollection<Warranties> Warranties { get; set; } = new List<Warranties>();
}

