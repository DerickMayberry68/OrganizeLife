using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class VExpiringWarranties
{
    public Guid? Id { get; set; }

    public Guid? HouseholdId { get; set; }

    public string? ItemName { get; set; }

    public string? Provider { get; set; }

    public DateOnly? EndDate { get; set; }

    public int? DaysUntilExpiry { get; set; }
}

