using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Healthcare providers (doctors, clinics, hospitals, specialists, etc.)
/// </summary>
public partial class HealthcareProviders
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public string Name { get; set; } = null!;

    public string? ProviderType { get; set; }

    public string? Specialty { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public string? Website { get; set; }

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? PostalCode { get; set; }

    public string? Country { get; set; }

    public string? Notes { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<Appointments> Appointments { get; set; } = new List<Appointments>();

    public virtual ICollection<MedicalRecords> MedicalRecords { get; set; } = new List<MedicalRecords>();

    public virtual ICollection<Medications> Medications { get; set; } = new List<Medications>();

    public virtual ICollection<Vaccinations> Vaccinations { get; set; } = new List<Vaccinations>();
}

