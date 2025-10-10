using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing financial transactions
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public TransactionsController(TheButlerDbContext context)
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
    /// Get all transactions for a specific household with optional filtering
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="startDate">Optional start date filter</param>
    /// <param name="endDate">Optional end date filter</param>
    /// <param name="accountId">Optional account ID filter</param>
    /// <param name="categoryId">Optional category ID filter</param>
    /// <param name="type">Optional transaction type filter</param>
    /// <returns>List of transactions</returns>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<TransactionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdTransactions(
        Guid householdId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] Guid? accountId = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? type = null)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.HouseholdId == householdId && t.DeletedAt == null);

        // Apply filters
        if (startDate.HasValue)
            query = query.Where(t => t.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.Date <= endDate.Value);

        if (accountId.HasValue)
            query = query.Where(t => t.AccountId == accountId.Value);

        if (categoryId.HasValue)
            query = query.Where(t => t.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(t => t.Type == type);

        var transactions = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => new TransactionResponseDto(
                t.Id,
                t.HouseholdId,
                t.AccountId,
                t.Account.Name,
                t.CategoryId,
                t.Category != null ? t.Category.Name : null,
                t.Date,
                t.Description,
                t.Amount,
                t.Type,
                t.MerchantName,
                t.Notes,
                t.PlaidTransactionId,
                t.IsRecurring ?? false,
                t.ParentTransactionId,
                t.CreatedAt,
                t.UpdatedAt
            ))
            .ToListAsync();

        return Ok(transactions);
    }

    /// <summary>
    /// Get transactions for a specific account
    /// </summary>
    /// <param name="accountId">The account ID</param>
    /// <param name="limit">Optional limit for number of transactions</param>
    /// <returns>List of transactions</returns>
    [HttpGet("account/{accountId}")]
    [ProducesResponseType(typeof(List<TransactionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccountTransactions(Guid accountId, [FromQuery] int limit = 100)
    {
        var account = await _context.Accounts
            .Where(a => a.Id == accountId && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (account == null)
        {
            return NotFound(new { Message = "Account not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(account.HouseholdId))
        {
            return Forbid();
        }

        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.AccountId == accountId && t.DeletedAt == null)
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Take(limit)
            .Select(t => new TransactionResponseDto(
                t.Id,
                t.HouseholdId,
                t.AccountId,
                t.Account.Name,
                t.CategoryId,
                t.Category != null ? t.Category.Name : null,
                t.Date,
                t.Description,
                t.Amount,
                t.Type,
                t.MerchantName,
                t.Notes,
                t.PlaidTransactionId,
                t.IsRecurring ?? false,
                t.ParentTransactionId,
                t.CreatedAt,
                t.UpdatedAt
            ))
            .ToListAsync();

        return Ok(transactions);
    }

    /// <summary>
    /// Get a specific transaction by ID
    /// </summary>
    /// <param name="id">The transaction ID</param>
    /// <returns>Transaction details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TransactionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransaction(Guid id)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.Id == id && t.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (transaction == null)
        {
            return NotFound(new { Message = "Transaction not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(transaction.HouseholdId))
        {
            return Forbid();
        }

        var response = new TransactionResponseDto(
            transaction.Id,
            transaction.HouseholdId,
            transaction.AccountId,
            transaction.Account.Name,
            transaction.CategoryId,
            transaction.Category?.Name,
            transaction.Date,
            transaction.Description,
            transaction.Amount,
            transaction.Type,
            transaction.MerchantName,
            transaction.Notes,
            transaction.PlaidTransactionId,
            transaction.IsRecurring ?? false,
            transaction.ParentTransactionId,
            transaction.CreatedAt,
            transaction.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new transaction
    /// </summary>
    /// <param name="dto">Transaction creation details</param>
    /// <returns>Created transaction</returns>
    [HttpPost]
    [ProducesResponseType(typeof(TransactionResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Description))
        {
            return BadRequest(new { Message = "Transaction description is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Type))
        {
            return BadRequest(new { Message = "Transaction type is required" });
        }

        // Verify account exists and belongs to the household
        var account = await _context.Accounts
            .Where(a => a.Id == dto.AccountId && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (account == null)
        {
            return BadRequest(new { Message = "Invalid account ID" });
        }

        if (account.HouseholdId != dto.HouseholdId)
        {
            return BadRequest(new { Message = "Account does not belong to specified household" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
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

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        // Create the transaction
        var transaction = new Transactions
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId,
            Date = dto.Date,
            Description = dto.Description,
            Amount = dto.Amount,
            Type = dto.Type,
            MerchantName = dto.MerchantName,
            Notes = dto.Notes,
            IsRecurring = dto.IsRecurring,
            ParentTransactionId = dto.ParentTransactionId,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        // Load related data for response
        var createdTransaction = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .FirstAsync(t => t.Id == transaction.Id);

        var response = new TransactionResponseDto(
            createdTransaction.Id,
            createdTransaction.HouseholdId,
            createdTransaction.AccountId,
            createdTransaction.Account.Name,
            createdTransaction.CategoryId,
            createdTransaction.Category?.Name,
            createdTransaction.Date,
            createdTransaction.Description,
            createdTransaction.Amount,
            createdTransaction.Type,
            createdTransaction.MerchantName,
            createdTransaction.Notes,
            createdTransaction.PlaidTransactionId,
            createdTransaction.IsRecurring ?? false,
            createdTransaction.ParentTransactionId,
            createdTransaction.CreatedAt,
            createdTransaction.UpdatedAt
        );

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, response);
    }

    /// <summary>
    /// Update an existing transaction
    /// </summary>
    /// <param name="id">The transaction ID</param>
    /// <param name="dto">Updated transaction details</param>
    /// <returns>Updated transaction</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TransactionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTransaction(Guid id, [FromBody] UpdateTransactionDto dto)
    {
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.Id == id && t.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (transaction == null)
        {
            return NotFound(new { Message = "Transaction not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(transaction.HouseholdId))
        {
            return Forbid();
        }

        // Update fields (only if provided in DTO)
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
            transaction.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Date.HasValue)
            transaction.Date = dto.Date.Value;

        if (dto.Description != null)
            transaction.Description = dto.Description;

        if (dto.Amount.HasValue)
            transaction.Amount = dto.Amount.Value;

        if (dto.Type != null)
            transaction.Type = dto.Type;

        if (dto.MerchantName != null)
            transaction.MerchantName = dto.MerchantName;

        if (dto.Notes != null)
            transaction.Notes = dto.Notes;

        if (dto.IsRecurring.HasValue)
            transaction.IsRecurring = dto.IsRecurring.Value;

        transaction.UpdatedAt = DateTime.UtcNow;
        transaction.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        // Reload to get updated relationships
        await _context.Entry(transaction).Reference(t => t.Category).LoadAsync();

        var response = new TransactionResponseDto(
            transaction.Id,
            transaction.HouseholdId,
            transaction.AccountId,
            transaction.Account.Name,
            transaction.CategoryId,
            transaction.Category?.Name,
            transaction.Date,
            transaction.Description,
            transaction.Amount,
            transaction.Type,
            transaction.MerchantName,
            transaction.Notes,
            transaction.PlaidTransactionId,
            transaction.IsRecurring ?? false,
            transaction.ParentTransactionId,
            transaction.CreatedAt,
            transaction.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a transaction (soft delete)
    /// </summary>
    /// <param name="id">The transaction ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTransaction(Guid id)
    {
        var transaction = await _context.Transactions
            .Where(t => t.Id == id && t.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (transaction == null)
        {
            return NotFound(new { Message = "Transaction not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(transaction.HouseholdId))
        {
            return Forbid();
        }

        // Soft delete
        transaction.DeletedAt = DateTime.UtcNow;
        transaction.UpdatedAt = DateTime.UtcNow;
        transaction.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get transaction summary for a household within a date range
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="startDate">Start date for summary</param>
    /// <param name="endDate">End date for summary</param>
    /// <returns>Transaction summary with statistics</returns>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(TransactionSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetTransactionSummary(
        Guid householdId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Transactions
            .Include(t => t.Category)
            .Where(t => t.HouseholdId == householdId && t.DeletedAt == null);

        if (startDate.HasValue)
            query = query.Where(t => t.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(t => t.Date <= endDate.Value);

        var transactions = await query.ToListAsync();

        var totalIncome = transactions.Where(t => t.Type == "Income").Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == "Expense").Sum(t => t.Amount);
        var netAmount = totalIncome - totalExpenses;

        // Calculate spending by category
        var categorySpending = transactions
            .Where(t => t.Type == "Expense")
            .GroupBy(t => new { t.CategoryId, CategoryName = t.Category != null ? t.Category.Name : "Uncategorized" })
            .Select(g => new CategorySpendingDto(
                g.Key.CategoryId,
                g.Key.CategoryName,
                g.Sum(t => t.Amount),
                g.Count(),
                totalExpenses > 0 ? (g.Sum(t => t.Amount) / totalExpenses) * 100 : 0
            ))
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        var summary = new TransactionSummaryDto(
            totalIncome,
            totalExpenses,
            netAmount,
            transactions.Count,
            transactions.Any() ? transactions.Min(t => t.Date) : null,
            transactions.Any() ? transactions.Max(t => t.Date) : null,
            categorySpending
        );

        return Ok(summary);
    }

    /// <summary>
    /// Search transactions by description or merchant name
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="searchTerm">Search term</param>
    /// <param name="limit">Maximum number of results</param>
    /// <returns>List of matching transactions</returns>
    [HttpGet("household/{householdId}/search")]
    [ProducesResponseType(typeof(List<TransactionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SearchTransactions(
        Guid householdId,
        [FromQuery] string searchTerm,
        [FromQuery] int limit = 50)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            return BadRequest(new { Message = "Search term is required" });
        }

        var transactions = await _context.Transactions
            .Include(t => t.Account)
            .Include(t => t.Category)
            .Where(t => t.HouseholdId == householdId 
                     && t.DeletedAt == null
                     && (t.Description.Contains(searchTerm) 
                         || (t.MerchantName != null && t.MerchantName.Contains(searchTerm))))
            .OrderByDescending(t => t.Date)
            .Take(limit)
            .Select(t => new TransactionResponseDto(
                t.Id,
                t.HouseholdId,
                t.AccountId,
                t.Account.Name,
                t.CategoryId,
                t.Category != null ? t.Category.Name : null,
                t.Date,
                t.Description,
                t.Amount,
                t.Type,
                t.MerchantName,
                t.Notes,
                t.PlaidTransactionId,
                t.IsRecurring ?? false,
                t.ParentTransactionId,
                t.CreatedAt,
                t.UpdatedAt
            ))
            .ToListAsync();

        return Ok(transactions);
    }
}

