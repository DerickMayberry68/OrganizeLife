using System;
using System.Collections.Generic;
using System.Net;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Audit trail of all user actions in the system.
/// </summary>
public partial class ActivityLogs
{
    public Guid Id { get; set; }

    public Guid? HouseholdId { get; set; }

    public Guid UserId { get; set; }

    public string Action { get; set; } = null!;

    public string EntityType { get; set; } = null!;

    public Guid EntityId { get; set; }

    public string? EntityName { get; set; }

    public string? Description { get; set; }

    public IPAddress? IpAddress { get; set; }

    public string? UserAgent { get; set; }

    public string? Metadata { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Households? Household { get; set; }
}

