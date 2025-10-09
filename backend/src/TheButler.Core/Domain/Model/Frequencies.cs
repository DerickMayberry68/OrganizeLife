using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class Frequencies
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public int IntervalDays { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Bills> Bills { get; set; } = new List<Bills>();

    public virtual ICollection<InsurancePolicies> InsurancePolicies { get; set; } = new List<InsurancePolicies>();

    public virtual ICollection<ItemMaintenanceSchedules> ItemMaintenanceSchedules { get; set; } = new List<ItemMaintenanceSchedules>();

    public virtual ICollection<MaintenanceTasks> MaintenanceTasks { get; set; } = new List<MaintenanceTasks>();

    public virtual ICollection<Subscriptions> Subscriptions { get; set; } = new List<Subscriptions>();
}

