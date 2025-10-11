using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Health metrics and vital signs tracking for household members
/// </summary>
public partial class HealthMetrics
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid HouseholdMemberId { get; set; }

    public DateOnly RecordDate { get; set; }

    public TimeOnly? RecordTime { get; set; }

    public string MetricType { get; set; } = null!;

    public decimal? Value { get; set; }

    public string? Unit { get; set; }

    public decimal? Weight { get; set; }

    public decimal? Height { get; set; }

    public decimal? Bmi { get; set; }

    public int? BloodPressureSystolic { get; set; }

    public int? BloodPressureDiastolic { get; set; }

    public int? HeartRate { get; set; }

    public decimal? Temperature { get; set; }

    public int? BloodGlucose { get; set; }

    public int? OxygenSaturation { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Households Household { get; set; } = null!;

    public virtual HouseholdMembers HouseholdMember { get; set; } = null!;
}

