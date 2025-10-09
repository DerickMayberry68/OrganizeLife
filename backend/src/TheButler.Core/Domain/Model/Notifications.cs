using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// User notifications for bills, maintenance, expiring documents, etc.
/// </summary>
public partial class Notifications
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid? HouseholdId { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string? Severity { get; set; }

    public bool? IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public string? ActionUrl { get; set; }

    public string? RelatedEntityType { get; set; }

    public Guid? RelatedEntityId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Households? Household { get; set; }
}

