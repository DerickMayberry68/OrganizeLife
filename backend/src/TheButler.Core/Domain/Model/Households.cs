using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Main organizational unit for TheButler app. All data is scoped to a household.
/// </summary>
public partial class Households
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string? AddressLine1 { get; set; }

    public string? AddressLine2 { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? PostalCode { get; set; }

    public string? Country { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual ICollection<Accounts> Accounts { get; set; } = new List<Accounts>();

    public virtual ICollection<ActivityLogs> ActivityLogs { get; set; } = new List<ActivityLogs>();

    public virtual ICollection<Bills> Bills { get; set; } = new List<Bills>();

    public virtual ICollection<Budgets> Budgets { get; set; } = new List<Budgets>();

    public virtual ICollection<Documents> Documents { get; set; } = new List<Documents>();

    public virtual ICollection<FinancialGoals> FinancialGoals { get; set; } = new List<FinancialGoals>();

    public virtual ICollection<HouseholdMembers> HouseholdMembers { get; set; } = new List<HouseholdMembers>();

    public virtual ICollection<HouseholdSettings> HouseholdSettings { get; set; } = new List<HouseholdSettings>();

    public virtual ICollection<InsurancePolicies> InsurancePolicies { get; set; } = new List<InsurancePolicies>();

    public virtual ICollection<InventoryItems> InventoryItems { get; set; } = new List<InventoryItems>();

    public virtual ICollection<MaintenanceTasks> MaintenanceTasks { get; set; } = new List<MaintenanceTasks>();

    public virtual ICollection<Notifications> Notifications { get; set; } = new List<Notifications>();

    public virtual ICollection<Reminders> Reminders { get; set; } = new List<Reminders>();

    public virtual ICollection<Subscriptions> Subscriptions { get; set; } = new List<Subscriptions>();

    public virtual ICollection<Transactions> Transactions { get; set; } = new List<Transactions>();

    public virtual ICollection<HealthcareProviders> HealthcareProviders { get; set; } = new List<HealthcareProviders>();

    public virtual ICollection<MedicalRecords> MedicalRecords { get; set; } = new List<MedicalRecords>();

    public virtual ICollection<Medications> Medications { get; set; } = new List<Medications>();

    public virtual ICollection<Appointments> Appointments { get; set; } = new List<Appointments>();

    public virtual ICollection<Vaccinations> Vaccinations { get; set; } = new List<Vaccinations>();

    public virtual ICollection<Allergies> Allergies { get; set; } = new List<Allergies>();

    public virtual ICollection<HealthMetrics> HealthMetrics { get; set; } = new List<HealthMetrics>();
}

