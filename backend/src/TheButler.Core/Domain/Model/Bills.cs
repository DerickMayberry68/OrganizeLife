using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Bills to be paid. Can be one-time or recurring.
/// </summary>
public partial class Bills
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid? AccountId { get; set; }

    public Guid? CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public decimal Amount { get; set; }

    public DateOnly DueDate { get; set; }

    public string Status { get; set; } = null!;

    public bool? IsRecurring { get; set; }

    public Guid? FrequencyId { get; set; }

    public string? PaymentMethod { get; set; }

    public bool? AutoPayEnabled { get; set; }

    public int? ReminderDays { get; set; }

    public string? PayeeName { get; set; }

    public string? PayeeAccountNumber { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Accounts? Account { get; set; }

    public virtual Categories? Category { get; set; }

    public virtual Frequencies? Frequency { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<PaymentHistory> PaymentHistory { get; set; } = new List<PaymentHistory>();
}

