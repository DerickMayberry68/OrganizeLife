using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Maintenance service providers. Shared resource across households.
/// </summary>
public partial class ServiceProviders
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public Guid? CategoryId { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Website { get; set; }

    public string? AddressLine1 { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? PostalCode { get; set; }

    public decimal? Rating { get; set; }

    public string? Notes { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual Categories? Category { get; set; }

    public virtual ICollection<MaintenanceTasks> MaintenanceTasks { get; set; } = new List<MaintenanceTasks>();
}

