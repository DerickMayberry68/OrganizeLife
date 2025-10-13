namespace TheButler.Api.DTOs;

#region Inventory Item DTOs

/// <summary>
/// Request DTO for creating an inventory item
/// </summary>
public record CreateInventoryItemDto(
    Guid HouseholdId,
    string Name,
    string? Description,
    DateOnly PurchaseDate,
    decimal PurchasePrice,
    string Location,
    Guid? CategoryId = null,
    decimal? CurrentValue = null,
    string? SerialNumber = null,
    string? ModelNumber = null,
    string? Manufacturer = null,
    List<string>? PhotoUrls = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating an inventory item
/// </summary>
public record UpdateInventoryItemDto(
    string? Name = null,
    string? Description = null,
    DateOnly? PurchaseDate = null,
    decimal? PurchasePrice = null,
    decimal? CurrentValue = null,
    string? Location = null,
    Guid? CategoryId = null,
    string? SerialNumber = null,
    string? ModelNumber = null,
    string? Manufacturer = null,
    List<string>? PhotoUrls = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for inventory item details
/// </summary>
public record InventoryItemResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid? CategoryId,
    string? CategoryName,
    string Name,
    string? Description,
    DateOnly PurchaseDate,
    decimal PurchasePrice,
    decimal? CurrentValue,
    string Location,
    string? SerialNumber,
    string? ModelNumber,
    string? Manufacturer,
    List<string>? PhotoUrls,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Inventory summary for a household
/// </summary>
public record InventorySummaryDto(
    int TotalItems,
    decimal TotalPurchaseValue,
    decimal TotalCurrentValue,
    decimal EstimatedDepreciation,
    List<CategoryInventoryStatsDto> CategoryBreakdown,
    List<LocationInventoryStatsDto> LocationBreakdown
);

/// <summary>
/// Inventory statistics by category
/// </summary>
public record CategoryInventoryStatsDto(
    Guid? CategoryId,
    string? CategoryName,
    int ItemCount,
    decimal TotalValue
);

/// <summary>
/// Inventory statistics by location
/// </summary>
public record LocationInventoryStatsDto(
    string Location,
    int ItemCount,
    decimal TotalValue
);

#endregion

