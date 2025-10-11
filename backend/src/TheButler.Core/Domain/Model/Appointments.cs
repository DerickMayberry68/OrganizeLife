using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Medical appointments for household members
/// </summary>
public partial class Appointments
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid HouseholdMemberId { get; set; }

    public Guid? ProviderId { get; set; }

    public DateOnly AppointmentDate { get; set; }

    public TimeOnly? AppointmentTime { get; set; }

    public string? AppointmentType { get; set; }

    public string? Reason { get; set; }

    public string? Status { get; set; }

    public string? Location { get; set; }

    public string? ProviderName { get; set; }

    public int? ReminderDays { get; set; }

    public bool? ReminderEnabled { get; set; }

    public string? PrepInstructions { get; set; }

    public string? FollowUpNotes { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual HouseholdMembers HouseholdMember { get; set; } = null!;

    public virtual HealthcareProviders? Provider { get; set; }
}

