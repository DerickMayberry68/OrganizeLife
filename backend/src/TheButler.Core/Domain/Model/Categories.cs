using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class Categories
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string? Description { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Bills> Bills { get; set; } = new List<Bills>();

    public virtual ICollection<Budgets> Budgets { get; set; } = new List<Budgets>();

    public virtual ICollection<Documents> Documents { get; set; } = new List<Documents>();

    public virtual ICollection<InventoryItems> InventoryItems { get; set; } = new List<InventoryItems>();

    public virtual ICollection<MaintenanceTasks> MaintenanceTasks { get; set; } = new List<MaintenanceTasks>();

    public virtual ICollection<ServiceProviders> ServiceProviders { get; set; } = new List<ServiceProviders>();

    public virtual ICollection<Subscriptions> Subscriptions { get; set; } = new List<Subscriptions>();

    public virtual ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();
}

