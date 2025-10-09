using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

public partial class VUpcomingBills
{
    public Guid? Id { get; set; }

    public Guid? HouseholdId { get; set; }

    public string? Name { get; set; }

    public decimal? Amount { get; set; }

    public DateOnly? DueDate { get; set; }

    public string? Status { get; set; }

    public string? CategoryName { get; set; }

    public int? DaysOverdue { get; set; }
}

