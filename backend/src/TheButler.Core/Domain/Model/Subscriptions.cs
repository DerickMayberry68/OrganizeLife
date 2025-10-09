using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Recurring subscriptions (streaming, software, etc.). Links to accounts.
/// </summary>
public partial class Subscriptions
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid? AccountId { get; set; }

    public Guid? CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Amount { get; set; }

    public Guid BillingCycleId { get; set; }

    public DateOnly NextBillingDate { get; set; }

    public bool? IsActive { get; set; }

    public bool? AutoRenew { get; set; }

    public string? MerchantWebsite { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Accounts? Account { get; set; }

    public virtual Frequencies BillingCycle { get; set; } = null!;

    public virtual Categories? Category { get; set; }

    public virtual Households Household { get; set; } = null!;
}

