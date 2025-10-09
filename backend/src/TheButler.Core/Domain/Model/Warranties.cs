using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Warranty information for inventory items. Check is_active by querying WHERE end_date &gt;= CURRENT_DATE.
/// </summary>
public partial class Warranties
{
    public Guid Id { get; set; }

    public Guid InventoryItemId { get; set; }

    public string Provider { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string? CoverageDetails { get; set; }

    public string? DocumentUrl { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual InventoryItems InventoryItem { get; set; } = null!;
}

