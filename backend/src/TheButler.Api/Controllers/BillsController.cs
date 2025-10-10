using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing bills and bill payments
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BillsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public BillsController(TheButlerDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get the current authenticated user's ID from JWT token
    /// </summary>
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("Invalid token - no user ID found");
        }
        return Guid.Parse(userIdClaim);
    }

    /// <summary>
    /// Check if user is a member of the specified household
    /// </summary>
    private async Task<bool> IsUserMemberOfHousehold(Guid householdId)
    {
        var userId = GetCurrentUserId();
        return await _context.HouseholdMembers
            .AnyAsync(hm => hm.HouseholdId == householdId 
                         && hm.UserId == userId 
                         && hm.IsActive == true);
    }

    /// <summary>
    /// Get all bills for a specific household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="status">Optional status filter</param>
    /// <param name="isRecurring">Optional recurring filter</param>
    /// <returns>List of bills</returns>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<BillResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdBills(
        Guid householdId,
        [FromQuery] string? status = null,
        [FromQuery] bool? isRecurring = null)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Bills
            .Include(b => b.Account)
            .Include(b => b.Category)
            .Include(b => b.Frequency)
            .Where(b => b.HouseholdId == householdId && b.DeletedAt == null);

        // Apply filters
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(b => b.Status == status);

        if (isRecurring.HasValue)
            query = query.Where(b => b.IsRecurring == isRecurring.Value);

        var bills = await query
            .OrderBy(b => b.DueDate)
            .ThenBy(b => b.Name)
            .Select(b => new BillResponseDto(
                b.Id,
                b.HouseholdId,
                b.AccountId,
                b.Account != null ? b.Account.Name : null,
                b.CategoryId,
                b.Category != null ? b.Category.Name : null,
                b.Name,
                b.Amount,
                b.DueDate,
                b.Status,
                b.IsRecurring ?? false,
                b.FrequencyId,
                b.Frequency != null ? b.Frequency.Name : null,
                b.PaymentMethod,
                b.AutoPayEnabled ?? false,
                b.ReminderDays,
                b.PayeeName,
                b.PayeeAccountNumber,
                b.Notes,
                b.CreatedAt,
                b.UpdatedAt
            ))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get upcoming bills for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="days">Number of days to look ahead (default 30)</param>
    /// <returns>List of upcoming bills</returns>
    [HttpGet("household/{householdId}/upcoming")]
    [ProducesResponseType(typeof(List<BillResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUpcomingBills(Guid householdId, [FromQuery] int days = 30)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = today.AddDays(days);

        var bills = await _context.Bills
            .Include(b => b.Account)
            .Include(b => b.Category)
            .Include(b => b.Frequency)
            .Where(b => b.HouseholdId == householdId 
                     && b.DeletedAt == null
                     && b.Status == "Pending"
                     && b.DueDate >= today
                     && b.DueDate <= endDate)
            .OrderBy(b => b.DueDate)
            .Select(b => new BillResponseDto(
                b.Id,
                b.HouseholdId,
                b.AccountId,
                b.Account != null ? b.Account.Name : null,
                b.CategoryId,
                b.Category != null ? b.Category.Name : null,
                b.Name,
                b.Amount,
                b.DueDate,
                b.Status,
                b.IsRecurring ?? false,
                b.FrequencyId,
                b.Frequency != null ? b.Frequency.Name : null,
                b.PaymentMethod,
                b.AutoPayEnabled ?? false,
                b.ReminderDays,
                b.PayeeName,
                b.PayeeAccountNumber,
                b.Notes,
                b.CreatedAt,
                b.UpdatedAt
            ))
            .ToListAsync();

        return Ok(bills);
    }

    /// <summary>
    /// Get a specific bill by ID
    /// </summary>
    /// <param name="id">The bill ID</param>
    /// <returns>Bill details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BillResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBill(Guid id)
    {
        var bill = await _context.Bills
            .Include(b => b.Account)
            .Include(b => b.Category)
            .Include(b => b.Frequency)
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            return NotFound(new { Message = "Bill not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
        {
            return Forbid();
        }

        var response = new BillResponseDto(
            bill.Id,
            bill.HouseholdId,
            bill.AccountId,
            bill.Account?.Name,
            bill.CategoryId,
            bill.Category?.Name,
            bill.Name,
            bill.Amount,
            bill.DueDate,
            bill.Status,
            bill.IsRecurring ?? false,
            bill.FrequencyId,
            bill.Frequency?.Name,
            bill.PaymentMethod,
            bill.AutoPayEnabled ?? false,
            bill.ReminderDays,
            bill.PayeeName,
            bill.PayeeAccountNumber,
            bill.Notes,
            bill.CreatedAt,
            bill.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new bill
    /// </summary>
    /// <param name="dto">Bill creation details</param>
    /// <returns>Created bill</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BillResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBill([FromBody] CreateBillDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Bill name is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Status))
        {
            return BadRequest(new { Message = "Bill status is required" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        // Verify account exists and belongs to the household if provided
        if (dto.AccountId.HasValue)
        {
            var account = await _context.Accounts
                .Where(a => a.Id == dto.AccountId.Value && a.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (account == null)
            {
                return BadRequest(new { Message = "Invalid account ID" });
            }

            if (account.HouseholdId != dto.HouseholdId)
            {
                return BadRequest(new { Message = "Account does not belong to specified household" });
            }
        }

        // Verify category exists if provided
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
        }

        // Verify frequency exists if provided
        if (dto.FrequencyId.HasValue)
        {
            var frequencyExists = await _context.Frequencies.AnyAsync(f => f.Id == dto.FrequencyId.Value);
            if (!frequencyExists)
            {
                return BadRequest(new { Message = "Invalid frequency ID" });
            }
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        // Create the bill
        var bill = new Bills
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Amount = dto.Amount,
            DueDate = dto.DueDate,
            Status = dto.Status,
            IsRecurring = dto.IsRecurring,
            FrequencyId = dto.FrequencyId,
            PaymentMethod = dto.PaymentMethod,
            AutoPayEnabled = dto.AutoPayEnabled,
            ReminderDays = dto.ReminderDays,
            PayeeName = dto.PayeeName,
            PayeeAccountNumber = dto.PayeeAccountNumber,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Bills.Add(bill);
        await _context.SaveChangesAsync();

        // Load related data for response
        var createdBill = await _context.Bills
            .Include(b => b.Account)
            .Include(b => b.Category)
            .Include(b => b.Frequency)
            .FirstAsync(b => b.Id == bill.Id);

        var response = new BillResponseDto(
            createdBill.Id,
            createdBill.HouseholdId,
            createdBill.AccountId,
            createdBill.Account?.Name,
            createdBill.CategoryId,
            createdBill.Category?.Name,
            createdBill.Name,
            createdBill.Amount,
            createdBill.DueDate,
            createdBill.Status,
            createdBill.IsRecurring ?? false,
            createdBill.FrequencyId,
            createdBill.Frequency?.Name,
            createdBill.PaymentMethod,
            createdBill.AutoPayEnabled ?? false,
            createdBill.ReminderDays,
            createdBill.PayeeName,
            createdBill.PayeeAccountNumber,
            createdBill.Notes,
            createdBill.CreatedAt,
            createdBill.UpdatedAt
        );

        return CreatedAtAction(nameof(GetBill), new { id = bill.Id }, response);
    }

    /// <summary>
    /// Update an existing bill
    /// </summary>
    /// <param name="id">The bill ID</param>
    /// <param name="dto">Updated bill details</param>
    /// <returns>Updated bill</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BillResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBill(Guid id, [FromBody] UpdateBillDto dto)
    {
        var bill = await _context.Bills
            .Include(b => b.Account)
            .Include(b => b.Category)
            .Include(b => b.Frequency)
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            return NotFound(new { Message = "Bill not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
        {
            return Forbid();
        }

        // Update fields (only if provided in DTO)
        if (dto.AccountId.HasValue)
        {
            var account = await _context.Accounts
                .Where(a => a.Id == dto.AccountId.Value && a.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (account == null || account.HouseholdId != bill.HouseholdId)
            {
                return BadRequest(new { Message = "Invalid account ID" });
            }
            bill.AccountId = dto.AccountId.Value;
        }

        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
            bill.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Name != null)
            bill.Name = dto.Name;

        if (dto.Amount.HasValue)
            bill.Amount = dto.Amount.Value;

        if (dto.DueDate.HasValue)
            bill.DueDate = dto.DueDate.Value;

        if (dto.Status != null)
            bill.Status = dto.Status;

        if (dto.IsRecurring.HasValue)
            bill.IsRecurring = dto.IsRecurring.Value;

        if (dto.FrequencyId.HasValue)
        {
            var frequencyExists = await _context.Frequencies.AnyAsync(f => f.Id == dto.FrequencyId.Value);
            if (!frequencyExists)
            {
                return BadRequest(new { Message = "Invalid frequency ID" });
            }
            bill.FrequencyId = dto.FrequencyId.Value;
        }

        if (dto.PaymentMethod != null)
            bill.PaymentMethod = dto.PaymentMethod;

        if (dto.AutoPayEnabled.HasValue)
            bill.AutoPayEnabled = dto.AutoPayEnabled.Value;

        if (dto.ReminderDays.HasValue)
            bill.ReminderDays = dto.ReminderDays.Value;

        if (dto.PayeeName != null)
            bill.PayeeName = dto.PayeeName;

        if (dto.PayeeAccountNumber != null)
            bill.PayeeAccountNumber = dto.PayeeAccountNumber;

        if (dto.Notes != null)
            bill.Notes = dto.Notes;

        bill.UpdatedAt = DateTime.UtcNow;
        bill.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        // Reload to get updated relationships
        await _context.Entry(bill).Reference(b => b.Account).LoadAsync();
        await _context.Entry(bill).Reference(b => b.Category).LoadAsync();
        await _context.Entry(bill).Reference(b => b.Frequency).LoadAsync();

        var response = new BillResponseDto(
            bill.Id,
            bill.HouseholdId,
            bill.AccountId,
            bill.Account?.Name,
            bill.CategoryId,
            bill.Category?.Name,
            bill.Name,
            bill.Amount,
            bill.DueDate,
            bill.Status,
            bill.IsRecurring ?? false,
            bill.FrequencyId,
            bill.Frequency?.Name,
            bill.PaymentMethod,
            bill.AutoPayEnabled ?? false,
            bill.ReminderDays,
            bill.PayeeName,
            bill.PayeeAccountNumber,
            bill.Notes,
            bill.CreatedAt,
            bill.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Mark a bill as paid
    /// </summary>
    /// <param name="id">The bill ID</param>
    /// <param name="dto">Payment details</param>
    /// <returns>Updated bill and payment history</returns>
    [HttpPost("{id}/mark-paid")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkBillPaid(Guid id, [FromBody] MarkBillPaidDto dto)
    {
        var bill = await _context.Bills
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            return NotFound(new { Message = "Bill not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        // Create payment history record
        var paymentHistory = new PaymentHistory
        {
            Id = Guid.NewGuid(),
            BillId = id,
            TransactionId = dto.TransactionId,
            PaidDate = dto.PaymentDate,
            Amount = dto.AmountPaid,
            ConfirmationNumber = dto.ConfirmationNumber,
            PaymentMethod = dto.PaymentMethod,
            Notes = dto.Notes,
            CreatedAt = now,
            CreatedBy = userId
        };

        _context.PaymentHistory.Add(paymentHistory);

        // Update bill status to paid
        bill.Status = "Paid";
        bill.UpdatedAt = now;
        bill.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Bill marked as paid successfully",
            BillId = bill.Id,
            PaymentHistoryId = paymentHistory.Id,
            Status = bill.Status
        });
    }

    /// <summary>
    /// Get payment history for a bill
    /// </summary>
    /// <param name="id">The bill ID</param>
    /// <returns>List of payment history records</returns>
    [HttpGet("{id}/payment-history")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBillPaymentHistory(Guid id)
    {
        var bill = await _context.Bills
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            return NotFound(new { Message = "Bill not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
        {
            return Forbid();
        }

        var paymentHistory = await _context.PaymentHistory
            .Where(ph => ph.BillId == id)
            .OrderByDescending(ph => ph.PaidDate)
            .Select(ph => new
            {
                ph.Id,
                ph.BillId,
                ph.TransactionId,
                ph.PaidDate,
                ph.Amount,
                ph.ConfirmationNumber,
                ph.PaymentMethod,
                ph.Notes,
                ph.CreatedAt
            })
            .ToListAsync();

        return Ok(paymentHistory);
    }

    /// <summary>
    /// Delete a bill (soft delete)
    /// </summary>
    /// <param name="id">The bill ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBill(Guid id)
    {
        var bill = await _context.Bills
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (bill == null)
        {
            return NotFound(new { Message = "Bill not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(bill.HouseholdId))
        {
            return Forbid();
        }

        // Soft delete
        bill.DeletedAt = DateTime.UtcNow;
        bill.UpdatedAt = DateTime.UtcNow;
        bill.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get bill summary for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>Bill summary with statistics</returns>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(BillSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBillSummary(Guid householdId)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var bills = await _context.Bills
            .Where(b => b.HouseholdId == householdId && b.DeletedAt == null)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next30Days = today.AddDays(30);

        var totalBills = bills.Count;
        var pendingBills = bills.Count(b => b.Status == "Pending");
        var paidBills = bills.Count(b => b.Status == "Paid");
        var overdueBills = bills.Count(b => b.Status == "Pending" && b.DueDate < today);
        var totalAmountDue = bills.Where(b => b.Status == "Pending").Sum(b => b.Amount);
        var totalAmountPaid = bills.Where(b => b.Status == "Paid").Sum(b => b.Amount);

        var upcomingBills = bills
            .Where(b => b.Status == "Pending" && b.DueDate >= today && b.DueDate <= next30Days)
            .OrderBy(b => b.DueDate)
            .Select(b => new UpcomingBillDto(
                b.Id,
                b.Name,
                b.Amount,
                b.DueDate,
                b.DueDate.DayNumber - today.DayNumber,
                b.Status,
                b.IsRecurring ?? false
            ))
            .ToList();

        var nextDueDate = bills
            .Where(b => b.Status == "Pending" && b.DueDate >= today)
            .OrderBy(b => b.DueDate)
            .Select(b => (DateOnly?)b.DueDate)
            .FirstOrDefault();

        var summary = new BillSummaryDto(
            totalBills,
            pendingBills,
            paidBills,
            overdueBills,
            totalAmountDue,
            totalAmountPaid,
            nextDueDate,
            upcomingBills
        );

        return Ok(summary);
    }
}

