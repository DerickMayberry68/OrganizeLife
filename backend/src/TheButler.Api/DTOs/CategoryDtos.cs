namespace TheButler.Api.DTOs;

/// <summary>
/// Request DTO for creating a new category
/// </summary>
public record CreateCategoryDto(
    string Name,
    string Type, // e.g., "Income", "Expense", "Transfer"
    string? Description
);

/// <summary>
/// Request DTO for updating a category
/// </summary>
public record UpdateCategoryDto(
    string? Name,
    string? Type,
    string? Description,
    bool? IsActive
);

/// <summary>
/// Response DTO for category details
/// </summary>
public record CategoryResponseDto(
    Guid Id,
    string Name,
    string Type,
    string? Description,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

