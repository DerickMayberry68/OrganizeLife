using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Links ASP.NET Identity users to households with role-based access.
/// </summary>
public partial class HouseholdMembers
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid UserId { get; set; }

    public string Role { get; set; } = null!;

    public DateTime JoinedAt { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual ICollection<MedicalRecords> MedicalRecords { get; set; } = new List<MedicalRecords>();

    public virtual ICollection<Medications> Medications { get; set; } = new List<Medications>();

    public virtual ICollection<Appointments> Appointments { get; set; } = new List<Appointments>();

    public virtual ICollection<Vaccinations> Vaccinations { get; set; } = new List<Vaccinations>();

    public virtual ICollection<Allergies> Allergies { get; set; } = new List<Allergies>();

    public virtual ICollection<HealthMetrics> HealthMetrics { get; set; } = new List<HealthMetrics>();
}

