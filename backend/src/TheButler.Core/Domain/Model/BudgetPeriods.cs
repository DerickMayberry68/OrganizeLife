using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Monthly snapshots of budget performance with auto-calculated metrics.
/// </summary>
public partial class BudgetPeriods
{
    public Guid Id { get; set; }

    public Guid BudgetId { get; set; }

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    public decimal LimitAmount { get; set; }

    public decimal SpentAmount { get; set; }

    public int? TransactionCount { get; set; }

    public decimal? PercentageUsed { get; set; }

    public string? Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Budgets Budget { get; set; } = null!;
}

