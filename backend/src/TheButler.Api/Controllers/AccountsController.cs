using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing financial accounts (checking, savings, credit cards, etc.)
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public AccountsController(TheButlerDbContext context)
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
    /// Get all accounts for a specific household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>List of accounts</returns>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<AccountResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHouseholdAccounts(Guid householdId)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var accounts = await _context.Accounts
            .Where(a => a.HouseholdId == householdId && a.DeletedAt == null)
            .OrderBy(a => a.Type)
            .ThenBy(a => a.Name)
            .Select(a => new AccountResponseDto(
                a.Id,
                a.HouseholdId,
                a.Name,
                a.Type,
                a.Institution,
                a.AccountNumberLast4,
                a.Balance,
                a.Currency ?? "USD",
                a.IsActive ?? true,
                a.LastSyncedAt,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync();

        return Ok(accounts);
    }

    /// <summary>
    /// Get a specific account by ID
    /// </summary>
    /// <param name="id">The account ID</param>
    /// <returns>Account details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AccountResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAccount(Guid id)
    {
        var account = await _context.Accounts
            .Where(a => a.Id == id && a.DeletedAt == null)
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

        var response = new AccountResponseDto(
            account.Id,
            account.HouseholdId,
            account.Name,
            account.Type,
            account.Institution,
            account.AccountNumberLast4,
            account.Balance,
            account.Currency ?? "USD",
            account.IsActive ?? true,
            account.LastSyncedAt,
            account.CreatedAt,
            account.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new financial account
    /// </summary>
    /// <param name="dto">Account creation details</param>
    /// <returns>Created account</returns>
    [HttpPost]
    [ProducesResponseType(typeof(AccountResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Account name is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Type))
        {
            return BadRequest(new { Message = "Account type is required" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        // Create the account
        var account = new Accounts
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            Name = dto.Name,
            Type = dto.Type,
            Institution = dto.Institution,
            AccountNumberLast4 = dto.AccountNumberLast4,
            Balance = dto.Balance,
            Currency = dto.Currency,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        var response = new AccountResponseDto(
            account.Id,
            account.HouseholdId,
            account.Name,
            account.Type,
            account.Institution,
            account.AccountNumberLast4,
            account.Balance,
            account.Currency ?? "USD",
            account.IsActive ?? true,
            account.LastSyncedAt,
            account.CreatedAt,
            account.UpdatedAt
        );

        return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, response);
    }

    /// <summary>
    /// Update an existing account
    /// </summary>
    /// <param name="id">The account ID</param>
    /// <param name="dto">Updated account details</param>
    /// <returns>Updated account</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AccountResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] UpdateAccountDto dto)
    {
        var account = await _context.Accounts
            .Where(a => a.Id == id && a.DeletedAt == null)
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

        // Update fields (only if provided in DTO)
        if (dto.Name != null)
            account.Name = dto.Name;
        
        if (dto.Institution != null)
            account.Institution = dto.Institution;
        
        if (dto.AccountNumberLast4 != null)
            account.AccountNumberLast4 = dto.AccountNumberLast4;
        
        if (dto.Balance.HasValue)
            account.Balance = dto.Balance.Value;
        
        if (dto.IsActive.HasValue)
            account.IsActive = dto.IsActive.Value;

        account.UpdatedAt = DateTime.UtcNow;
        account.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new AccountResponseDto(
            account.Id,
            account.HouseholdId,
            account.Name,
            account.Type,
            account.Institution,
            account.AccountNumberLast4,
            account.Balance,
            account.Currency ?? "USD",
            account.IsActive ?? true,
            account.LastSyncedAt,
            account.CreatedAt,
            account.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete an account (soft delete)
    /// </summary>
    /// <param name="id">The account ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var account = await _context.Accounts
            .Where(a => a.Id == id && a.DeletedAt == null)
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

        // Soft delete
        account.DeletedAt = DateTime.UtcNow;
        account.UpdatedAt = DateTime.UtcNow;
        account.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get account summary for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>Account summary with totals by type</returns>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAccountSummary(Guid householdId)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var accounts = await _context.Accounts
            .Where(a => a.HouseholdId == householdId && a.DeletedAt == null && a.IsActive == true)
            .ToListAsync();

        var summary = new
        {
            TotalAccounts = accounts.Count,
            TotalBalance = accounts.Sum(a => a.Balance),
            ByType = accounts
                .GroupBy(a => a.Type)
                .Select(g => new
                {
                    Type = g.Key,
                    Count = g.Count(),
                    TotalBalance = g.Sum(a => a.Balance)
                })
                .OrderByDescending(x => x.TotalBalance)
                .ToList(),
            LastUpdated = accounts.Any() ? accounts.Max(a => a.UpdatedAt) : DateTime.UtcNow
        };

        return Ok(summary);
    }
}

