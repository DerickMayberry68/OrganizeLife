namespace TheButler.Api.DTOs;

/// <summary>
/// Request DTO for creating a new subscription
/// </summary>
public record CreateSubscriptionDto(
    Guid HouseholdId,
    Guid? AccountId,
    Guid? CategoryId,
    string Name,
    decimal Amount,
    Guid BillingCycleId,
    DateOnly NextBillingDate,
    bool IsActive = true,
    bool AutoRenew = true,
    string? MerchantWebsite = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a subscription
/// </summary>
public record UpdateSubscriptionDto(
    Guid? AccountId,
    Guid? CategoryId,
    string? Name,
    decimal? Amount,
    Guid? BillingCycleId,
    DateOnly? NextBillingDate,
    bool? IsActive,
    bool? AutoRenew,
    string? MerchantWebsite,
    string? Notes
);

/// <summary>
/// Response DTO for subscription details
/// </summary>
public record SubscriptionResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid? AccountId,
    string? AccountName,
    Guid? CategoryId,
    string? CategoryName,
    string Name,
    decimal Amount,
    Guid BillingCycleId,
    string BillingCycleName,
    DateOnly NextBillingDate,
    bool IsActive,
    bool AutoRenew,
    string? MerchantWebsite,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Response DTO for subscription summary
/// </summary>
public record SubscriptionSummaryDto(
    int TotalSubscriptions,
    int ActiveSubscriptions,
    int InactiveSubscriptions,
    decimal TotalMonthlyAmount,
    decimal TotalYearlyAmount,
    List<UpcomingRenewalDto> UpcomingRenewals,
    List<CategorySubscriptionDto> ByCategory
);

/// <summary>
/// DTO for upcoming subscription renewals
/// </summary>
public record UpcomingRenewalDto(
    Guid Id,
    string Name,
    decimal Amount,
    DateOnly NextBillingDate,
    int DaysUntilRenewal,
    string BillingCycle,
    bool AutoRenew
);

/// <summary>
/// DTO for subscriptions grouped by category
/// </summary>
public record CategorySubscriptionDto(
    Guid? CategoryId,
    string? CategoryName,
    int Count,
    decimal TotalAmount
);

