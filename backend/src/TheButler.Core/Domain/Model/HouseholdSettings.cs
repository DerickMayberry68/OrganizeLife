using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Key-value store for household preferences and settings.
/// </summary>
public partial class HouseholdSettings
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public string SettingKey { get; set; } = null!;

    public string? SettingValue { get; set; }

    public string DataType { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public virtual Households Household { get; set; } = null!;
}

