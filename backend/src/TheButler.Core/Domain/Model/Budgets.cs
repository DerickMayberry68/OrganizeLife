using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Budget definitions per category.
/// </summary>
public partial class Budgets
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public decimal LimitAmount { get; set; }

    public string Period { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<BudgetPeriods> BudgetPeriods { get; set; } = new List<BudgetPeriods>();

    public virtual Categories Category { get; set; } = null!;

    public virtual Households Household { get; set; } = null!;
}

