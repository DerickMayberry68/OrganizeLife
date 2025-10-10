namespace TheButler.Api.DTOs;

/// <summary>
/// Request DTO for creating a new budget
/// </summary>
public record CreateBudgetDto(
    Guid HouseholdId,
    Guid CategoryId,
    string Name,
    decimal LimitAmount,
    string Period, // e.g., "Monthly", "Quarterly", "Yearly"
    DateOnly StartDate,
    DateOnly? EndDate = null,
    bool IsActive = true
);

/// <summary>
/// Request DTO for updating a budget
/// </summary>
public record UpdateBudgetDto(
    Guid? CategoryId,
    string? Name,
    decimal? LimitAmount,
    string? Period,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool? IsActive
);

/// <summary>
/// Response DTO for budget details
/// </summary>
public record BudgetResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid CategoryId,
    string CategoryName,
    string Name,
    decimal LimitAmount,
    string Period,
    DateOnly StartDate,
    DateOnly? EndDate,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Response DTO for budget performance/status
/// </summary>
public record BudgetPerformanceDto(
    Guid BudgetId,
    string BudgetName,
    Guid CategoryId,
    string CategoryName,
    decimal LimitAmount,
    decimal SpentAmount,
    decimal RemainingAmount,
    decimal PercentageUsed,
    string Status, // e.g., "Under Budget", "Near Limit", "Over Budget"
    DateOnly PeriodStart,
    DateOnly PeriodEnd,
    int TransactionCount
);

/// <summary>
/// Response DTO for household budget summary
/// </summary>
public record BudgetSummaryDto(
    int TotalBudgets,
    int ActiveBudgets,
    decimal TotalBudgeted,
    decimal TotalSpent,
    decimal TotalRemaining,
    decimal OverallPercentageUsed,
    int BudgetsOverLimit,
    List<BudgetPerformanceDto> BudgetPerformances
);

