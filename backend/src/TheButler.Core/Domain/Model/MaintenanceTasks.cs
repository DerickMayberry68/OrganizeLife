using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Home maintenance tasks and schedules.
/// </summary>
public partial class MaintenanceTasks
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid? ServiceProviderId { get; set; }

    public Guid? CategoryId { get; set; }

    public Guid? PriorityId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string Status { get; set; } = null!;

    public DateOnly DueDate { get; set; }

    public DateOnly? CompletedDate { get; set; }

    public decimal? EstimatedCost { get; set; }

    public decimal? ActualCost { get; set; }

    public bool? IsRecurring { get; set; }

    public Guid? FrequencyId { get; set; }

    public string? Location { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Categories? Category { get; set; }

    public virtual Frequencies? Frequency { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual Priorities? Priority { get; set; }

    public virtual ServiceProviders? ServiceProvider { get; set; }
}

