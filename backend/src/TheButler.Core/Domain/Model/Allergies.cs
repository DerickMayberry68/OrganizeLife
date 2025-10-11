using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Allergy information for household members
/// </summary>
public partial class Allergies
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid HouseholdMemberId { get; set; }

    public string AllergyType { get; set; } = null!;

    public string Allergen { get; set; } = null!;

    public string? Severity { get; set; }

    public string? Reaction { get; set; }

    public DateOnly? DiagnosedDate { get; set; }

    public string? Treatment { get; set; }

    public bool? IsActive { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual HouseholdMembers HouseholdMember { get; set; } = null!;
}

