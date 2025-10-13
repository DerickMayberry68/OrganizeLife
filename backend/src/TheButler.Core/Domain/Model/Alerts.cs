using System;
using System.ComponentModel.DataAnnotations;
using TheButler.Core.Domain.Interfaces;

namespace TheButler.Core.Domain.Model
{
    public class Alerts : IEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid HouseholdId { get; set; }

        // Alert Classification
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // AlertType enum values

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // AlertCategory enum values

        [Required]
        [MaxLength(50)]
        public string Severity { get; set; } = string.Empty; // AlertSeverity enum values

        [Required]
        public int Priority { get; set; } // 1-4 (Low, Medium, High, Urgent)

        // Alert Content
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        // Related Entity (for deep linking)
        [MaxLength(100)]
        public string? RelatedEntityType { get; set; } // 'Bill', 'Maintenance', 'Healthcare', etc.

        public Guid? RelatedEntityId { get; set; }

        [MaxLength(200)]
        public string? RelatedEntityName { get; set; }

        // Status & Timing
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // AlertStatus enum values

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public bool IsDismissed { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? ReadAt { get; set; }

        public DateTime? DismissedAt { get; set; }

        public DateTime? ExpiresAt { get; set; }

        // Action (optional deep link)
        [MaxLength(500)]
        public string? ActionUrl { get; set; } // e.g., '/bills?id=123'

        [MaxLength(100)]
        public string? ActionLabel { get; set; } // e.g., 'View Bill', 'Schedule Appointment'

        // Recurrence (for repeating alerts)
        [Required]
        public bool IsRecurring { get; set; } = false;

        [MaxLength(100)]
        public string? RecurrenceRule { get; set; } // e.g., 'DAILY', 'WEEKLY', 'MONTHLY'

        public DateTime? NextOccurrence { get; set; }

        // Audit fields
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Navigation Properties
        public virtual Households Household { get; set; } = null!;
    }

    // Enum values as constants for validation
    public static class AlertType
    {
        public const string Reminder = "Reminder";
        public const string Warning = "Warning";
        public const string Error = "Error";
        public const string Info = "Info";
        public const string Success = "Success";
    }

    public static class AlertCategory
    {
        public const string Bills = "Bills";
        public const string Maintenance = "Maintenance";
        public const string Healthcare = "Healthcare";
        public const string Insurance = "Insurance";
        public const string Documents = "Documents";
        public const string Inventory = "Inventory";
        public const string Budget = "Budget";
        public const string Financial = "Financial";
        public const string System = "System";
    }

    public static class AlertSeverity
    {
        public const string Low = "Low";
        public const string Medium = "Medium";
        public const string High = "High";
        public const string Critical = "Critical";
    }

    public static class AlertPriority
    {
        public const int Low = 1;
        public const int Medium = 2;
        public const int High = 3;
        public const int Urgent = 4;
    }

    public static class AlertStatus
    {
        public const string Active = "Active";
        public const string Read = "Read";
        public const string Dismissed = "Dismissed";
        public const string Expired = "Expired";
        public const string Archived = "Archived";
    }
}

