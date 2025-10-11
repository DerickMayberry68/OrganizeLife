using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Vaccination and immunization records for household members
/// </summary>
public partial class Vaccinations
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid HouseholdMemberId { get; set; }

    public Guid? ProviderId { get; set; }

    public string VaccineName { get; set; } = null!;

    public DateOnly DateAdministered { get; set; }

    public string? DoseNumber { get; set; }

    public string? LotNumber { get; set; }

    public string? Site { get; set; }

    public string? Route { get; set; }

    public DateOnly? NextDoseDate { get; set; }

    public bool? IsUpToDate { get; set; }

    public string? AdministeredBy { get; set; }

    public string? Location { get; set; }

    public string? Reactions { get; set; }

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

