using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class FinancialGoals
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public decimal TargetAmount { get; set; }

    public decimal CurrentAmount { get; set; }

    public DateOnly? Deadline { get; set; }

    public Guid? PriorityId { get; set; }

    public bool? IsAchieved { get; set; }

    public DateOnly? AchievedDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual Priorities? Priority { get; set; }
}

