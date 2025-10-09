using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Historical record of bill payments. Links to transactions.
/// </summary>
public partial class PaymentHistory
{
    public Guid Id { get; set; }

    public Guid BillId { get; set; }

    public Guid? TransactionId { get; set; }

    public DateOnly PaidDate { get; set; }

    public decimal Amount { get; set; }

    public string? ConfirmationNumber { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public virtual Bills Bill { get; set; } = null!;

    public virtual Transactions? Transaction { get; set; }
}

