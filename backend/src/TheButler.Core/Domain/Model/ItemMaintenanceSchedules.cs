using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Recurring maintenance schedules for specific items.
/// </summary>
public partial class ItemMaintenanceSchedules
{
    public Guid Id { get; set; }

    public Guid InventoryItemId { get; set; }

    public string Task { get; set; } = null!;

    public string? Description { get; set; }

    public Guid FrequencyId { get; set; }

    public DateOnly? LastCompleted { get; set; }

    public DateOnly NextDue { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual Frequencies Frequency { get; set; } = null!;

    public virtual InventoryItems InventoryItem { get; set; } = null!;
}

