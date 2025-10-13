using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TheButler.Api.DTOs
{
    // ==================== REQUEST DTOs ====================

    public class CreateAlertDto
    {
        [Required]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // Reminder, Warning, Error, Info, Success

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty; // Bills, Maintenance, Healthcare, etc.

        [Required]
        [MaxLength(50)]
        public string Severity { get; set; } = string.Empty; // Low, Medium, High, Critical

        [Required]
        [Range(1, 4)]
        public int Priority { get; set; } // 1-4 (Low, Medium, High, Urgent)

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? RelatedEntityType { get; set; }

        public Guid? RelatedEntityId { get; set; }

        [MaxLength(200)]
        public string? RelatedEntityName { get; set; }

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        [MaxLength(100)]
        public string? ActionLabel { get; set; }

        public DateTime? ExpiresAt { get; set; }

        public bool IsRecurring { get; set; } = false;

        [MaxLength(100)]
        public string? RecurrenceRule { get; set; }

        public DateTime? NextOccurrence { get; set; }
    }

    public class UpdateAlertDto
    {
        [MaxLength(50)]
        public string? Type { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; }

        [MaxLength(50)]
        public string? Severity { get; set; }

        [Range(1, 4)]
        public int? Priority { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? Message { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(100)]
        public string? RelatedEntityType { get; set; }

        public Guid? RelatedEntityId { get; set; }

        [MaxLength(200)]
        public string? RelatedEntityName { get; set; }

        [MaxLength(500)]
        public string? ActionUrl { get; set; }

        [MaxLength(100)]
        public string? ActionLabel { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; }

        public bool? IsRead { get; set; }

        public bool? IsDismissed { get; set; }

        public DateTime? ExpiresAt { get; set; }

        public bool? IsRecurring { get; set; }

        [MaxLength(100)]
        public string? RecurrenceRule { get; set; }

        public DateTime? NextOccurrence { get; set; }
    }

    // ==================== RESPONSE DTOs ====================

    public class AlertResponseDto
    {
        public Guid Id { get; set; }
        public Guid HouseholdId { get; set; }

        // Classification
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public int Priority { get; set; }

        // Content
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Related Entity
        public string? RelatedEntityType { get; set; }
        public Guid? RelatedEntityId { get; set; }
        public string? RelatedEntityName { get; set; }

        // Status & Timing
        public string Status { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public bool IsDismissed { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime? DismissedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }

        // Action
        public string? ActionUrl { get; set; }
        public string? ActionLabel { get; set; }

        // Recurrence
        public bool IsRecurring { get; set; }
        public string? RecurrenceRule { get; set; }
        public DateTime? NextOccurrence { get; set; }

        // Audit
        public DateTime? UpdatedAt { get; set; }
    }

    // ==================== STATISTICS DTOs ====================

    public class AlertStatsDto
    {
        public int TotalAlerts { get; set; }
        public int UnreadAlerts { get; set; }
        public int CriticalAlerts { get; set; }
        public int HighPriorityAlerts { get; set; }
        public Dictionary<string, int> AlertsByCategory { get; set; } = new();
        public Dictionary<string, int> AlertsBySeverity { get; set; } = new();
        public Dictionary<string, int> AlertsByStatus { get; set; } = new();
        public int ActiveAlerts { get; set; }
        public int DismissedAlerts { get; set; }
        public int ExpiredAlerts { get; set; }
    }

    // ==================== GENERATION RESULT DTOs ====================

    public class AlertGenerationResultDto
    {
        public int Generated { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
    }

    public class AllAlertsGenerationResultDto
    {
        public int TotalGenerated { get; set; }
        public Dictionary<string, int> ByCategory { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    // ==================== SUMMARY DTOs ====================

    public class AlertSummaryDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public int Priority { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ActionUrl { get; set; }
    }

    // ==================== BULK OPERATION DTOs ====================

    public class BulkOperationResultDto
    {
        public int Count { get; set; }
        public string Operation { get; set; } = string.Empty;
        public DateTime OperationAt { get; set; }
    }
}

