namespace TheButler.Api.DTOs;

/// <summary>
/// Request DTO for creating a new bill
/// </summary>
public record CreateBillDto(
    Guid HouseholdId,
    Guid? AccountId,
    Guid? CategoryId,
    string Name,
    decimal Amount,
    DateOnly DueDate,
    string Status, // e.g., "Pending", "Paid", "Overdue", "Cancelled"
    bool IsRecurring = false,
    Guid? FrequencyId = null,
    string? PaymentMethod = null,
    bool AutoPayEnabled = false,
    int? ReminderDays = null,
    string? PayeeName = null,
    string? PayeeAccountNumber = null,
    string? Notes = null
);

/// <summary>
/// Request DTO for updating a bill
/// </summary>
public record UpdateBillDto(
    Guid? AccountId,
    Guid? CategoryId,
    string? Name,
    decimal? Amount,
    DateOnly? DueDate,
    string? Status,
    bool? IsRecurring,
    Guid? FrequencyId,
    string? PaymentMethod,
    bool? AutoPayEnabled,
    int? ReminderDays,
    string? PayeeName,
    string? PayeeAccountNumber,
    string? Notes
);

/// <summary>
/// Response DTO for bill details
/// </summary>
public record BillResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid? AccountId,
    string? AccountName,
    Guid? CategoryId,
    string? CategoryName,
    string Name,
    decimal Amount,
    DateOnly DueDate,
    string Status,
    bool IsRecurring,
    Guid? FrequencyId,
    string? FrequencyName,
    string? PaymentMethod,
    bool AutoPayEnabled,
    int? ReminderDays,
    string? PayeeName,
    string? PayeeAccountNumber,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Request DTO for marking a bill as paid
/// </summary>
public record MarkBillPaidDto(
    DateOnly PaymentDate,
    decimal AmountPaid,
    Guid? TransactionId = null,
    string? PaymentMethod = null,
    string? ConfirmationNumber = null,
    string? Notes = null
);

/// <summary>
/// Response DTO for bill summary
/// </summary>
public record BillSummaryDto(
    int TotalBills,
    int PendingBills,
    int PaidBills,
    int OverdueBills,
    decimal TotalAmountDue,
    decimal TotalAmountPaid,
    DateOnly? NextDueDate,
    List<UpcomingBillDto> UpcomingBills
);

/// <summary>
/// DTO for upcoming bill information
/// </summary>
public record UpcomingBillDto(
    Guid Id,
    string Name,
    decimal Amount,
    DateOnly DueDate,
    int DaysUntilDue,
    string Status,
    bool IsRecurring
);

