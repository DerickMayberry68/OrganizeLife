namespace TheButler.Api.DTOs;

/// <summary>
/// Request DTO for creating a new transaction
/// </summary>
public record CreateTransactionDto(
    Guid HouseholdId,
    Guid AccountId,
    Guid? CategoryId,
    DateOnly Date,
    string Description,
    decimal Amount,
    string Type, // e.g., "Income", "Expense", "Transfer"
    string? MerchantName,
    string? Notes,
    bool IsRecurring = false,
    Guid? ParentTransactionId = null
);

/// <summary>
/// Request DTO for updating a transaction
/// </summary>
public record UpdateTransactionDto(
    Guid? CategoryId,
    DateOnly? Date,
    string? Description,
    decimal? Amount,
    string? Type,
    string? MerchantName,
    string? Notes,
    bool? IsRecurring
);

/// <summary>
/// Response DTO for transaction details
/// </summary>
public record TransactionResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid AccountId,
    string AccountName,
    Guid? CategoryId,
    string? CategoryName,
    DateOnly Date,
    string Description,
    decimal Amount,
    string Type,
    string? MerchantName,
    string? Notes,
    string? PlaidTransactionId,
    bool IsRecurring,
    Guid? ParentTransactionId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Request DTO for transaction filtering and search
/// </summary>
public record TransactionFilterDto(
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    Guid? AccountId = null,
    Guid? CategoryId = null,
    string? Type = null,
    string? SearchTerm = null,
    decimal? MinAmount = null,
    decimal? MaxAmount = null
);

/// <summary>
/// Response DTO for transaction summary statistics
/// </summary>
public record TransactionSummaryDto(
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal NetAmount,
    int TransactionCount,
    DateOnly? EarliestDate,
    DateOnly? LatestDate,
    List<CategorySpendingDto> SpendingByCategory
);

/// <summary>
/// DTO for category spending breakdown
/// </summary>
public record CategorySpendingDto(
    Guid? CategoryId,
    string? CategoryName,
    decimal TotalAmount,
    int TransactionCount,
    decimal Percentage
);

