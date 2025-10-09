using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class Priorities
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<FinancialGoals> FinancialGoals { get; set; } = new List<FinancialGoals>();

    public virtual ICollection<MaintenanceTasks> MaintenanceTasks { get; set; } = new List<MaintenanceTasks>();
}

