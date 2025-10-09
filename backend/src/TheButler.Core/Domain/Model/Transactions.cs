using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// All financial transactions. Links to accounts and categories.
/// </summary>
public partial class Transactions
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid AccountId { get; set; }

    public Guid? CategoryId { get; set; }

    public DateOnly Date { get; set; }

    public string Description { get; set; } = null!;

    public decimal Amount { get; set; }

    public string Type { get; set; } = null!;

    public string? MerchantName { get; set; }

    public string? Notes { get; set; }

    public string? PlaidTransactionId { get; set; }

    public bool? IsRecurring { get; set; }

    public Guid? ParentTransactionId { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Accounts Account { get; set; } = null!;

    public virtual Categories? Category { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<Transactions> InverseParentTransaction { get; set; } = new List<Transactions>();

    public virtual Transactions? ParentTransaction { get; set; }

    public virtual ICollection<PaymentHistory> PaymentHistory { get; set; } = new List<PaymentHistory>();
}

