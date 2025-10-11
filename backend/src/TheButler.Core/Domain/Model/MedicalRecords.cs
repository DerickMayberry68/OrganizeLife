using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Medical records and health history for household members
/// </summary>
public partial class MedicalRecords
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid HouseholdMemberId { get; set; }

    public Guid? ProviderId { get; set; }

    public DateOnly RecordDate { get; set; }

    public string RecordType { get; set; } = null!;

    public string? Diagnosis { get; set; }

    public string? Treatment { get; set; }

    public string? Medications { get; set; }

    public string? TestResults { get; set; }

    public string? FollowUpInstructions { get; set; }

    public DateOnly? FollowUpDate { get; set; }

    public string? DocumentUrl { get; set; }

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

