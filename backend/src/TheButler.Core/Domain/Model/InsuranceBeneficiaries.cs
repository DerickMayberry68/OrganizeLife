using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Beneficiaries for insurance policies.
/// </summary>
public partial class InsuranceBeneficiaries
{
    public Guid Id { get; set; }

    public Guid InsurancePolicyId { get; set; }

    public string Name { get; set; } = null!;

    public string? Relationship { get; set; }

    public decimal? Percentage { get; set; }

    public string? ContactInfo { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual InsurancePolicies InsurancePolicy { get; set; } = null!;
}

