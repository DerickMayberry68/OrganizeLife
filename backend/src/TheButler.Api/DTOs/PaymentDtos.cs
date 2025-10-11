namespace TheButler.Api.DTOs;

#region Payment History DTOs

/// <summary>
/// Response DTO for payment history details
/// </summary>
public record PaymentHistoryResponseDto(
    Guid Id,
    Guid BillId,
    string? BillName,
    Guid? TransactionId,
    DateOnly PaidDate,
    decimal Amount,
    string? ConfirmationNumber,
    string? PaymentMethod,
    string? Notes,
    DateTime CreatedAt
);

/// <summary>
/// Request DTO for recording a payment
/// </summary>
public record RecordPaymentDto(
    Guid BillId,
    DateOnly PaidDate,
    decimal Amount,
    string? PaymentMethod = null,
    string? ConfirmationNumber = null,
    Guid? TransactionId = null,
    string? Notes = null
);

#endregion

#region Payment Analytics DTOs

/// <summary>
/// Payment summary for a household
/// </summary>
public record PaymentSummaryDto(
    decimal TotalPaid,
    decimal TotalPending,
    decimal TotalOverdue,
    int PaymentsThisMonth,
    int PaymentsThisYear,
    decimal AveragePaymentAmount,
    List<PaymentMethodBreakdownDto> PaymentMethodBreakdown,
    List<MonthlyPaymentTrendDto> MonthlyTrend
);

/// <summary>
/// Breakdown of payments by payment method
/// </summary>
public record PaymentMethodBreakdownDto(
    string? PaymentMethod,
    int Count,
    decimal TotalAmount,
    decimal Percentage
);

/// <summary>
/// Monthly payment trend data
/// </summary>
public record MonthlyPaymentTrendDto(
    int Year,
    int Month,
    string MonthName,
    decimal TotalAmount,
    int PaymentCount
);

/// <summary>
/// Payment calendar data for visualization
/// </summary>
public record PaymentCalendarDto(
    DateOnly Date,
    List<PaymentCalendarItemDto> Payments,
    decimal TotalAmount
);

/// <summary>
/// Individual payment item for calendar
/// </summary>
public record PaymentCalendarItemDto(
    Guid PaymentId,
    Guid BillId,
    string BillName,
    decimal Amount,
    string? PaymentMethod,
    string Status
);

/// <summary>
/// Payment forecast for upcoming bills
/// </summary>
public record PaymentForecastDto(
    DateOnly StartDate,
    DateOnly EndDate,
    decimal TotalExpected,
    List<ForecastItemDto> Items
);

/// <summary>
/// Individual forecast item
/// </summary>
public record ForecastItemDto(
    Guid BillId,
    string BillName,
    DateOnly DueDate,
    decimal Amount,
    bool IsRecurring,
    string? PaymentMethod
);

#endregion

#region Payment Method DTOs

/// <summary>
/// Payment method statistics
/// </summary>
public record PaymentMethodStatsDto(
    string? PaymentMethod,
    int TotalPayments,
    decimal TotalAmount,
    decimal AverageAmount,
    DateOnly? LastUsed,
    int TimesUsedThisMonth
);

/// <summary>
/// Recent payments list
/// </summary>
public record RecentPaymentDto(
    Guid Id,
    Guid BillId,
    string? BillName,
    DateOnly PaidDate,
    decimal Amount,
    string? PaymentMethod,
    string? ConfirmationNumber
);

#endregion

#region Payment Reports DTOs

/// <summary>
/// Payment history report with filters
/// </summary>
public record PaymentReportDto(
    DateOnly StartDate,
    DateOnly EndDate,
    int TotalPayments,
    decimal TotalAmount,
    decimal AveragePayment,
    List<PaymentHistoryResponseDto> Payments
);

/// <summary>
/// Category-wise payment breakdown
/// </summary>
public record CategoryPaymentBreakdownDto(
    Guid? CategoryId,
    string? CategoryName,
    int PaymentCount,
    decimal TotalAmount,
    decimal Percentage
);

#endregion

