using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Financial accounts (checking, savings, credit cards, investments).
/// </summary>
public partial class Accounts
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public string Name { get; set; } = null!;

    public string Type { get; set; } = null!;

    public string Institution { get; set; } = null!;

    public string? AccountNumberLast4 { get; set; }

    public decimal Balance { get; set; }

    public string? Currency { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? LastSyncedAt { get; set; }

    public string? PlaidAccountId { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<Bills> Bills { get; set; } = new List<Bills>();

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<Subscriptions> Subscriptions { get; set; } = new List<Subscriptions>();

    public virtual ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();
}

