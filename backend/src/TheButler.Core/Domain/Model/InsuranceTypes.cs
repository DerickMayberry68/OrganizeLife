using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class InsuranceTypes
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<InsurancePolicies> InsurancePolicies { get; set; } = new List<InsurancePolicies>();
}

