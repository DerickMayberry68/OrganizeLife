namespace TheButler.Api.DTOs;

#region Maintenance Task DTOs

/// <summary>
/// Request DTO for creating a maintenance task
/// </summary>
public record CreateMaintenanceTaskDto(
    Guid HouseholdId,
    string Title,
    string? Description = null,
    string Status = "Pending",
    DateOnly DueDate = default,
    Guid? ServiceProviderId = null,
    Guid? CategoryId = null,
    Guid? PriorityId = null,
    decimal? EstimatedCost = null,
    bool IsRecurring = false,
    Guid? FrequencyId = null,
    string? Location = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a maintenance task
/// </summary>
public record UpdateMaintenanceTaskDto(
    string? Title = null,
    string? Description = null,
    string? Status = null,
    DateOnly? DueDate = null,
    Guid? ServiceProviderId = null,
    Guid? CategoryId = null,
    Guid? PriorityId = null,
    decimal? EstimatedCost = null,
    decimal? ActualCost = null,
    bool? IsRecurring = null,
    Guid? FrequencyId = null,
    string? Location = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for maintenance task details
/// </summary>
public record MaintenanceTaskResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid? ServiceProviderId,
    string? ServiceProviderName,
    Guid? CategoryId,
    string? CategoryName,
    Guid? PriorityId,
    string? PriorityName,
    string Title,
    string? Description,
    string Status,
    DateOnly DueDate,
    DateOnly? CompletedDate,
    decimal? EstimatedCost,
    decimal? ActualCost,
    bool IsRecurring,
    Guid? FrequencyId,
    string? FrequencyName,
    string? Location,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Request DTO for completing a maintenance task
/// </summary>
public record CompleteMaintenanceTaskDto(
    DateOnly CompletedDate,
    decimal? ActualCost = null,
    string? Notes = null
);

#endregion

#region Maintenance Summary DTOs

/// <summary>
/// Maintenance summary for a household
/// </summary>
public record MaintenanceSummaryDto(
    int TotalTasks,
    int PendingTasks,
    int InProgressTasks,
    int CompletedTasks,
    int OverdueTasks,
    decimal TotalEstimatedCost,
    decimal TotalActualCost,
    DateOnly? NextDueDate,
    List<UpcomingMaintenanceDto> UpcomingTasks
);

/// <summary>
/// Upcoming maintenance task
/// </summary>
public record UpcomingMaintenanceDto(
    Guid Id,
    string Title,
    DateOnly DueDate,
    int DaysUntilDue,
    string Status,
    string? PriorityName,
    decimal? EstimatedCost,
    string? Location
);

/// <summary>
/// Maintenance task with overdue information
/// </summary>
public record OverdueMaintenanceDto(
    Guid Id,
    string Title,
    DateOnly DueDate,
    int DaysOverdue,
    string Status,
    string? PriorityName,
    decimal? EstimatedCost,
    string? ServiceProviderName
);

#endregion

#region Maintenance Analytics DTOs

/// <summary>
/// Maintenance statistics by status
/// </summary>
public record MaintenanceStatusStatsDto(
    string Status,
    int Count,
    decimal TotalEstimatedCost,
    decimal TotalActualCost
);

/// <summary>
/// Maintenance statistics by category
/// </summary>
public record MaintenanceCategoryStatsDto(
    Guid? CategoryId,
    string? CategoryName,
    int TaskCount,
    decimal TotalCost,
    int CompletedCount,
    int PendingCount
);

/// <summary>
/// Maintenance cost analysis
/// </summary>
public record MaintenanceCostAnalysisDto(
    decimal TotalEstimated,
    decimal TotalActual,
    decimal Variance,
    decimal AverageEstimated,
    decimal AverageActual,
    List<MonthlyMaintenanceCostDto> MonthlyBreakdown
);

/// <summary>
/// Monthly maintenance cost breakdown
/// </summary>
public record MonthlyMaintenanceCostDto(
    int Year,
    int Month,
    string MonthName,
    decimal EstimatedCost,
    decimal ActualCost,
    int TaskCount
);

#endregion

