using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class VBudgetPerformance
{
    public Guid? BudgetId { get; set; }

    public Guid? HouseholdId { get; set; }

    public string? BudgetName { get; set; }

    public string? CategoryName { get; set; }

    public DateOnly? PeriodStart { get; set; }

    public DateOnly? PeriodEnd { get; set; }

    public decimal? LimitAmount { get; set; }

    public decimal? SpentAmount { get; set; }

    public decimal? PercentageUsed { get; set; }

    public string? Status { get; set; }

    public int? TransactionCount { get; set; }
}

