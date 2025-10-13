using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for payment management, analytics, and reporting
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public PaymentsController(TheButlerDbContext context)
    {
        _context = context;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("Invalid token - no user ID found");
        }
        return Guid.Parse(userIdClaim);
    }

    private async Task<bool> IsUserMemberOfHousehold(Guid householdId)
    {
        var userId = GetCurrentUserId();
        return await _context.HouseholdMembers
            .AnyAsync(hm => hm.HouseholdId == householdId 
                         && hm.UserId == userId 
                         && hm.IsActive == true);
    }

    #region Payment History

    /// <summary>
    /// Get all payment history for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<PaymentHistoryResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdPayments(
        Guid householdId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] string? paymentMethod = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Bill.HouseholdId == householdId);

        if (startDate.HasValue)
            query = query.Where(ph => ph.PaidDate >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(ph => ph.PaidDate <= endDate.Value);

        if (!string.IsNullOrWhiteSpace(paymentMethod))
            query = query.Where(ph => ph.PaymentMethod == paymentMethod);

        var payments = await query
            .OrderByDescending(ph => ph.PaidDate)
            .Select(ph => new PaymentHistoryResponseDto(
                ph.Id,
                ph.BillId,
                ph.Bill.Name,
                ph.TransactionId,
                ph.PaidDate,
                ph.Amount,
                ph.ConfirmationNumber,
                ph.PaymentMethod,
                ph.Notes,
                ph.CreatedAt
            ))
            .ToListAsync();

        return Ok(payments);
    }

    /// <summary>
    /// Get recent payments for a household
    /// </summary>
    [HttpGet("household/{householdId}/recent")]
    [ProducesResponseType(typeof(List<RecentPaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRecentPayments(Guid householdId, [FromQuery] int limit = 10)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var payments = await _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Bill.HouseholdId == householdId)
            .OrderByDescending(ph => ph.PaidDate)
            .ThenByDescending(ph => ph.CreatedAt)
            .Take(limit)
            .Select(ph => new RecentPaymentDto(
                ph.Id,
                ph.BillId,
                ph.Bill.Name,
                ph.PaidDate,
                ph.Amount,
                ph.PaymentMethod,
                ph.ConfirmationNumber
            ))
            .ToListAsync();

        return Ok(payments);
    }

    /// <summary>
    /// Record a payment for a bill
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PaymentHistoryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordPayment([FromBody] RecordPaymentDto dto)
    {
        var bill = await _context.Bills
            .Where(b => b.Id == dto.BillId && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            return NotFound(new { Message = "Bill not found" });
        }

        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var payment = new PaymentHistory
        {
            Id = Guid.NewGuid(),
            BillId = dto.BillId,
            TransactionId = dto.TransactionId,
            PaidDate = dto.PaidDate,
            Amount = dto.Amount,
            ConfirmationNumber = dto.ConfirmationNumber,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            CreatedAt = now,
            CreatedBy = userId
        };

        _context.PaymentHistory.Add(payment);

        // Update bill status
        bill.Status = "Paid";
        bill.UpdatedAt = now;
        bill.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        var response = new PaymentHistoryResponseDto(
            payment.Id,
            payment.BillId,
            bill.Name,
            payment.TransactionId,
            payment.PaidDate,
            payment.Amount,
            payment.ConfirmationNumber,
            payment.PaymentMethod,
            payment.Notes,
            payment.CreatedAt
        );

        return CreatedAtAction(nameof(GetHouseholdPayments), new { householdId = bill.HouseholdId }, response);
    }

    #endregion

    #region Payment Analytics

    /// <summary>
    /// Get payment summary and analytics for a household
    /// </summary>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(PaymentSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPaymentSummary(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);
        var startOfYear = new DateOnly(today.Year, 1, 1);

        // Get all payments for the household
        var payments = await _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Bill.HouseholdId == householdId)
            .ToListAsync();

        var totalPaid = payments.Sum(p => p.Amount);

        // Get pending bills
        var pendingBills = await _context.Bills
            .Where(b => b.HouseholdId == householdId 
                     && b.DeletedAt == null 
                     && b.Status == "Pending")
            .ToListAsync();

        var totalPending = pendingBills.Where(b => b.DueDate >= today).Sum(b => b.Amount);
        var totalOverdue = pendingBills.Where(b => b.DueDate < today).Sum(b => b.Amount);

        var paymentsThisMonth = payments.Count(p => p.PaidDate >= startOfMonth);
        var paymentsThisYear = payments.Count(p => p.PaidDate >= startOfYear);
        var averagePayment = payments.Any() ? payments.Average(p => p.Amount) : 0;

        // Payment method breakdown
        var methodBreakdown = payments
            .GroupBy(p => p.PaymentMethod ?? "Unspecified")
            .Select(g => new PaymentMethodBreakdownDto(
                g.Key,
                g.Count(),
                g.Sum(p => p.Amount),
                totalPaid > 0 ? (g.Sum(p => p.Amount) / totalPaid) * 100 : 0
            ))
            .OrderByDescending(m => m.TotalAmount)
            .ToList();

        // Monthly trend (last 12 months)
        var twelveMonthsAgo = today.AddMonths(-12);
        var monthlyTrend = payments
            .Where(p => p.PaidDate >= twelveMonthsAgo)
            .GroupBy(p => new { p.PaidDate.Year, p.PaidDate.Month })
            .Select(g => new MonthlyPaymentTrendDto(
                g.Key.Year,
                g.Key.Month,
                new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                g.Sum(p => p.Amount),
                g.Count()
            ))
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        var summary = new PaymentSummaryDto(
            totalPaid,
            totalPending,
            totalOverdue,
            paymentsThisMonth,
            paymentsThisYear,
            averagePayment,
            methodBreakdown,
            monthlyTrend
        );

        return Ok(summary);
    }

    /// <summary>
    /// Get payment calendar for a date range
    /// </summary>
    [HttpGet("household/{householdId}/calendar")]
    [ProducesResponseType(typeof(List<PaymentCalendarDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPaymentCalendar(
        Guid householdId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var start = startDate ?? DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1));
        var end = endDate ?? DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(1));

        // Get payments
        var payments = await _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Bill.HouseholdId == householdId
                      && ph.PaidDate >= start
                      && ph.PaidDate <= end)
            .ToListAsync();

        // Get upcoming bills
        var upcomingBills = await _context.Bills
            .Where(b => b.HouseholdId == householdId
                     && b.DeletedAt == null
                     && b.Status == "Pending"
                     && b.DueDate >= start
                     && b.DueDate <= end)
            .ToListAsync();

        var calendar = new List<PaymentCalendarDto>();

        // Group payments by date
        var paymentGroups = payments.GroupBy(p => p.PaidDate);
        foreach (var group in paymentGroups)
        {
            var items = group.Select(p => new PaymentCalendarItemDto(
                p.Id,
                p.BillId,
                p.Bill.Name,
                p.Amount,
                p.PaymentMethod,
                "Paid"
            )).ToList();

            calendar.Add(new PaymentCalendarDto(
                group.Key,
                items,
                group.Sum(p => p.Amount)
            ));
        }

        // Add upcoming bills
        var billGroups = upcomingBills.GroupBy(b => b.DueDate);
        foreach (var group in billGroups)
        {
            var existingDay = calendar.FirstOrDefault(c => c.Date == group.Key);
            var items = group.Select(b => new PaymentCalendarItemDto(
                Guid.Empty, // No payment ID yet
                b.Id,
                b.Name,
                b.Amount,
                b.PaymentMethod,
                b.DueDate < DateOnly.FromDateTime(DateTime.UtcNow) ? "Overdue" : "Pending"
            )).ToList();

            if (existingDay != null)
            {
                calendar.Remove(existingDay);
                items.AddRange(existingDay.Payments);
                calendar.Add(new PaymentCalendarDto(
                    group.Key,
                    items,
                    existingDay.TotalAmount + group.Sum(b => b.Amount)
                ));
            }
            else
            {
                calendar.Add(new PaymentCalendarDto(
                    group.Key,
                    items,
                    group.Sum(b => b.Amount)
                ));
            }
        }

        return Ok(calendar.OrderBy(c => c.Date));
    }

    /// <summary>
    /// Get payment forecast for upcoming bills
    /// </summary>
    [HttpGet("household/{householdId}/forecast")]
    [ProducesResponseType(typeof(PaymentForecastDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPaymentForecast(Guid householdId, [FromQuery] int days = 30)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = today.AddDays(days);

        var upcomingBills = await _context.Bills
            .Where(b => b.HouseholdId == householdId
                     && b.DeletedAt == null
                     && b.Status == "Pending"
                     && b.DueDate >= today
                     && b.DueDate <= endDate)
            .OrderBy(b => b.DueDate)
            .Select(b => new ForecastItemDto(
                b.Id,
                b.Name,
                b.DueDate,
                b.Amount,
                b.IsRecurring ?? false,
                b.PaymentMethod
            ))
            .ToListAsync();

        var forecast = new PaymentForecastDto(
            today,
            endDate,
            upcomingBills.Sum(b => b.Amount),
            upcomingBills
        );

        return Ok(forecast);
    }

    #endregion

    #region Payment Methods & Stats

    /// <summary>
    /// Get payment method statistics
    /// </summary>
    [HttpGet("household/{householdId}/methods/stats")]
    [ProducesResponseType(typeof(List<PaymentMethodStatsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPaymentMethodStats(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startOfMonth = new DateOnly(today.Year, today.Month, 1);

        var payments = await _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Bill.HouseholdId == householdId)
            .ToListAsync();

        var stats = payments
            .GroupBy(p => p.PaymentMethod ?? "Unspecified")
            .Select(g => new PaymentMethodStatsDto(
                g.Key,
                g.Count(),
                g.Sum(p => p.Amount),
                g.Average(p => p.Amount),
                g.Max(p => p.PaidDate),
                g.Count(p => p.PaidDate >= startOfMonth)
            ))
            .OrderByDescending(s => s.TotalAmount)
            .ToList();

        return Ok(stats);
    }

    #endregion

    #region Reports

    /// <summary>
    /// Get payment report for a date range
    /// </summary>
    [HttpGet("household/{householdId}/report")]
    [ProducesResponseType(typeof(PaymentReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPaymentReport(
        Guid householdId,
        [FromQuery] DateOnly startDate,
        [FromQuery] DateOnly endDate)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var payments = await _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Bill.HouseholdId == householdId
                      && ph.PaidDate >= startDate
                      && ph.PaidDate <= endDate)
            .OrderBy(ph => ph.PaidDate)
            .Select(ph => new PaymentHistoryResponseDto(
                ph.Id,
                ph.BillId,
                ph.Bill.Name,
                ph.TransactionId,
                ph.PaidDate,
                ph.Amount,
                ph.ConfirmationNumber,
                ph.PaymentMethod,
                ph.Notes,
                ph.CreatedAt
            ))
            .ToListAsync();

        var report = new PaymentReportDto(
            startDate,
            endDate,
            payments.Count,
            payments.Sum(p => p.Amount),
            payments.Any() ? payments.Average(p => p.Amount) : 0,
            payments
        );

        return Ok(report);
    }

    /// <summary>
    /// Get category-wise payment breakdown
    /// </summary>
    [HttpGet("household/{householdId}/by-category")]
    [ProducesResponseType(typeof(List<CategoryPaymentBreakdownDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPaymentsByCategory(
        Guid householdId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var start = startDate ?? DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-1));
        var end = endDate ?? DateOnly.FromDateTime(DateTime.UtcNow);

        var payments = await _context.PaymentHistory
            .Include(ph => ph.Bill)
                .ThenInclude(b => b.Category)
            .Where(ph => ph.Bill.HouseholdId == householdId
                      && ph.PaidDate >= start
                      && ph.PaidDate <= end)
            .ToListAsync();

        var total = payments.Sum(p => p.Amount);

        var breakdown = payments
            .GroupBy(p => new { 
                p.Bill.CategoryId, 
                CategoryName = p.Bill.Category != null ? p.Bill.Category.Name : "Uncategorized" 
            })
            .Select(g => new CategoryPaymentBreakdownDto(
                g.Key.CategoryId,
                g.Key.CategoryName,
                g.Count(),
                g.Sum(p => p.Amount),
                total > 0 ? (g.Sum(p => p.Amount) / total) * 100 : 0
            ))
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        return Ok(breakdown);
    }

    #endregion

    #region Payment History

    /// <summary>
    /// Get payment history for a specific bill
    /// </summary>
    [HttpGet("bill/{billId}/history")]
    [ProducesResponseType(typeof(List<PaymentHistoryResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBillPaymentHistory(Guid billId)
    {
        var bill = await _context.Bills
            .Where(b => b.Id == billId && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
            return NotFound(new { message = "Bill not found" });

        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
            return Forbid();

        var paymentHistory = await _context.PaymentHistory
            .Where(ph => ph.BillId == billId)
            .OrderByDescending(ph => ph.PaidDate)
            .Select(ph => new PaymentHistoryResponseDto(
                ph.Id,
                ph.BillId,
                ph.Bill.Name,
                ph.TransactionId,
                ph.PaidDate,
                ph.Amount,
                ph.ConfirmationNumber,
                ph.PaymentMethod,
                ph.Notes,
                ph.CreatedAt
            ))
            .ToListAsync();

        return Ok(paymentHistory);
    }

    /// <summary>
    /// Record a bill payment
    /// </summary>
    [HttpPost("bill/{billId}/history")]
    [ProducesResponseType(typeof(PaymentHistoryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordBillPayment(Guid billId, [FromBody] RecordPaymentDto dto)
    {
        var bill = await _context.Bills
            .Where(b => b.Id == billId && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
            return NotFound(new { message = "Bill not found" });

        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var payment = new PaymentHistory
        {
            Id = Guid.NewGuid(),
            BillId = billId,
            TransactionId = dto.TransactionId,
            PaidDate = dto.PaidDate,
            Amount = dto.Amount,
            ConfirmationNumber = dto.ConfirmationNumber,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            CreatedAt = now,
            CreatedBy = userId
        };

        _context.PaymentHistory.Add(payment);

        // Check if bill is fully paid
        var totalPaid = await _context.PaymentHistory
            .Where(ph => ph.BillId == billId)
            .SumAsync(ph => ph.Amount);
        totalPaid += dto.Amount;

        if (totalPaid >= bill.Amount)
        {
            bill.Status = "Paid";
            bill.UpdatedAt = now;
            bill.UpdatedBy = userId;
        }

        await _context.SaveChangesAsync();

        var response = new PaymentHistoryResponseDto(
            payment.Id,
            payment.BillId,
            bill.Name,
            payment.TransactionId,
            payment.PaidDate,
            payment.Amount,
            payment.ConfirmationNumber,
            payment.PaymentMethod,
            payment.Notes,
            payment.CreatedAt
        );

        return CreatedAtAction(nameof(GetBillPaymentHistory), new { billId = billId }, response);
    }

    /// <summary>
    /// Delete a payment history record
    /// </summary>
    [HttpDelete("history/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePaymentHistory(Guid id)
    {
        var payment = await _context.PaymentHistory
            .Include(ph => ph.Bill)
            .Where(ph => ph.Id == id)
            .FirstOrDefaultAsync();

        if (payment == null)
            return NotFound(new { message = "Payment history record not found" });

        if (!await IsUserMemberOfHousehold(payment.Bill.HouseholdId))
            return Forbid();

        _context.PaymentHistory.Remove(payment);

        // Recalculate bill status
        var totalPaid = await _context.PaymentHistory
            .Where(ph => ph.BillId == payment.BillId && ph.Id != id)
            .SumAsync(ph => ph.Amount);

        if (totalPaid < payment.Bill.Amount)
        {
            payment.Bill.Status = "Pending";
            payment.Bill.UpdatedAt = DateTime.UtcNow;
            payment.Bill.UpdatedBy = GetCurrentUserId();
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    #endregion
}

