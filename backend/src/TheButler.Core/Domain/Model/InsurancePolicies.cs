using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Insurance policies (home, auto, health, life, etc.).
/// </summary>
public partial class InsurancePolicies
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid InsuranceTypeId { get; set; }

    public string Provider { get; set; } = null!;

    public string PolicyNumber { get; set; } = null!;

    public decimal Premium { get; set; }

    public Guid BillingFrequencyId { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly RenewalDate { get; set; }

    public decimal? CoverageAmount { get; set; }

    public decimal? Deductible { get; set; }

    public string? CoverageDetails { get; set; }

    public bool? IsActive { get; set; }

    public string? DocumentUrl { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Frequencies BillingFrequency { get; set; } = null!;

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<InsuranceBeneficiaries> InsuranceBeneficiaries { get; set; } = new List<InsuranceBeneficiaries>();

    public virtual InsuranceTypes InsuranceType { get; set; } = null!;
}

