using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Scheduled reminders for upcoming events.
/// </summary>
public partial class Reminders
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid? UserId { get; set; }

    public string RelatedEntityType { get; set; } = null!;

    public Guid RelatedEntityId { get; set; }

    public string ReminderType { get; set; } = null!;

    public DateTime RemindAt { get; set; }

    public bool? IsSent { get; set; }

    public DateTime? SentAt { get; set; }

    public string? RecurrencePattern { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual Households Household { get; set; } = null!;
}

