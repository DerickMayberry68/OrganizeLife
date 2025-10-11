using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Medication schedules and reminders for when to take medications
/// </summary>
public partial class MedicationSchedules
{
    public Guid Id { get; set; }

    public Guid MedicationId { get; set; }

    public TimeOnly ScheduledTime { get; set; }

    public string? DayOfWeek { get; set; }

    public bool? IsActive { get; set; }

    public bool? ReminderEnabled { get; set; }

    public int? ReminderMinutesBefore { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Medications Medication { get; set; } = null!;
}

