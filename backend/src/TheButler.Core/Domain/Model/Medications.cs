using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Prescription and over-the-counter medications for household members
/// </summary>
public partial class Medications
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid HouseholdMemberId { get; set; }

    public Guid? ProviderId { get; set; }

    public string Name { get; set; } = null!;

    public string? GenericName { get; set; }

    public string? Dosage { get; set; }

    public string? Frequency { get; set; }

    public string? Route { get; set; }

    public string? Reason { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsPrescription { get; set; }

    public string? PrescriptionNumber { get; set; }

    public int? RefillsRemaining { get; set; }

    public string? Pharmacy { get; set; }

    public string? PharmacyPhone { get; set; }

    public string? SideEffects { get; set; }

    public string? Instructions { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual HouseholdMembers HouseholdMember { get; set; } = null!;

    public virtual HealthcareProviders? Provider { get; set; }

    public virtual ICollection<MedicationSchedules> MedicationSchedules { get; set; } = new List<MedicationSchedules>();
}

