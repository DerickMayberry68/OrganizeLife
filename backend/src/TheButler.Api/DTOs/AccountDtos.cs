namespace TheButler.Api.DTOs;

/// <summary>
/// Request DTO for creating a new account
/// </summary>
public record CreateAccountDto(
    Guid HouseholdId,
    string Name,
    string Type, // e.g., "Checking", "Savings", "Credit Card", "Investment"
    string? Institution,
    string? AccountNumberLast4,
    decimal Balance,
    string Currency = "USD"
);

/// <summary>
/// Request DTO for updating an account
/// </summary>
public record UpdateAccountDto(
    string? Name,
    string? Institution,
    string? AccountNumberLast4,
    decimal? Balance,
    bool? IsActive
);

/// <summary>
/// Response DTO for account details
/// </summary>
public record AccountResponseDto(
    Guid Id,
    Guid HouseholdId,
    string Name,
    string Type,
    string? Institution,
    string? AccountNumberLast4,
    decimal Balance,
    string Currency,
    bool IsActive,
    DateTime? LastSyncedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

