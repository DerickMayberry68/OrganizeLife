namespace TheButler.Api.DTOs;

#region Insurance Policy DTOs

/// <summary>
/// Request DTO for creating an insurance policy
/// </summary>
public record CreateInsurancePolicyDto(
    Guid HouseholdId,
    Guid InsuranceTypeId,
    string Provider,
    string PolicyNumber,
    decimal Premium,
    Guid BillingFrequencyId,
    DateOnly StartDate,
    DateOnly RenewalDate,
    decimal? CoverageAmount = null,
    decimal? Deductible = null,
    string? CoverageDetails = null,
    bool IsActive = true,
    string? DocumentUrl = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating an insurance policy
/// </summary>
public record UpdateInsurancePolicyDto(
    Guid? InsuranceTypeId = null,
    string? Provider = null,
    string? PolicyNumber = null,
    decimal? Premium = null,
    Guid? BillingFrequencyId = null,
    DateOnly? StartDate = null,
    DateOnly? RenewalDate = null,
    decimal? CoverageAmount = null,
    decimal? Deductible = null,
    string? CoverageDetails = null,
    bool? IsActive = null,
    string? DocumentUrl = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for insurance policy details
/// </summary>
public record InsurancePolicyResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid InsuranceTypeId,
    string? InsuranceTypeName,
    string Provider,
    string PolicyNumber,
    decimal Premium,
    Guid BillingFrequencyId,
    string? BillingFrequencyName,
    DateOnly StartDate,
    DateOnly RenewalDate,
    decimal? CoverageAmount,
    decimal? Deductible,
    string? CoverageDetails,
    bool IsActive,
    string? DocumentUrl,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Insurance summary for a household
/// </summary>
public record InsuranceSummaryDto(
    int TotalPolicies,
    int ActivePolicies,
    decimal TotalMonthlyCost,
    decimal TotalYearlyCost,
    decimal TotalCoverageAmount,
    int PoliciesNeedingRenewal,
    List<RenewalReminderDto> UpcomingRenewals
);

/// <summary>
/// Policy renewal reminder
/// </summary>
public record RenewalReminderDto(
    Guid Id,
    string Provider,
    string PolicyNumber,
    string? InsuranceTypeName,
    DateOnly RenewalDate,
    int DaysUntilRenewal,
    decimal Premium
);

#endregion

