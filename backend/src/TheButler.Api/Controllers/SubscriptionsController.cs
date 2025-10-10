using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing subscriptions and recurring payments
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public SubscriptionsController(TheButlerDbContext context)
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
    /// Get all subscriptions for a specific household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="isActive">Optional filter for active subscriptions</param>
    /// <returns>List of subscriptions</returns>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<SubscriptionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdSubscriptions(
        Guid householdId,
        [FromQuery] bool? isActive = null)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Subscriptions
            .Include(s => s.Account)
            .Include(s => s.Category)
            .Include(s => s.BillingCycle)
            .Where(s => s.HouseholdId == householdId && s.DeletedAt == null);

        if (isActive.HasValue)
            query = query.Where(s => s.IsActive == isActive.Value);

        var subscriptions = await query
            .OrderBy(s => s.NextBillingDate)
            .ThenBy(s => s.Name)
            .Select(s => new SubscriptionResponseDto(
                s.Id,
                s.HouseholdId,
                s.AccountId,
                s.Account != null ? s.Account.Name : null,
                s.CategoryId,
                s.Category != null ? s.Category.Name : null,
                s.Name,
                s.Amount,
                s.BillingCycleId,
                s.BillingCycle.Name,
                s.NextBillingDate,
                s.IsActive ?? true,
                s.AutoRenew ?? true,
                s.MerchantWebsite,
                s.Notes,
                s.CreatedAt,
                s.UpdatedAt
            ))
            .ToListAsync();

        return Ok(subscriptions);
    }

    /// <summary>
    /// Get upcoming subscription renewals
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="days">Number of days to look ahead (default 30)</param>
    /// <returns>List of upcoming renewals</returns>
    [HttpGet("household/{householdId}/upcoming")]
    [ProducesResponseType(typeof(List<SubscriptionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUpcomingRenewals(Guid householdId, [FromQuery] int days = 30)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = today.AddDays(days);

        var subscriptions = await _context.Subscriptions
            .Include(s => s.Account)
            .Include(s => s.Category)
            .Include(s => s.BillingCycle)
            .Where(s => s.HouseholdId == householdId 
                     && s.DeletedAt == null
                     && s.IsActive == true
                     && s.NextBillingDate >= today
                     && s.NextBillingDate <= endDate)
            .OrderBy(s => s.NextBillingDate)
            .Select(s => new SubscriptionResponseDto(
                s.Id,
                s.HouseholdId,
                s.AccountId,
                s.Account != null ? s.Account.Name : null,
                s.CategoryId,
                s.Category != null ? s.Category.Name : null,
                s.Name,
                s.Amount,
                s.BillingCycleId,
                s.BillingCycle.Name,
                s.NextBillingDate,
                s.IsActive ?? true,
                s.AutoRenew ?? true,
                s.MerchantWebsite,
                s.Notes,
                s.CreatedAt,
                s.UpdatedAt
            ))
            .ToListAsync();

        return Ok(subscriptions);
    }

    /// <summary>
    /// Get a specific subscription by ID
    /// </summary>
    /// <param name="id">The subscription ID</param>
    /// <returns>Subscription details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SubscriptionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSubscription(Guid id)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Account)
            .Include(s => s.Category)
            .Include(s => s.BillingCycle)
            .Where(s => s.Id == id && s.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (subscription == null)
        {
            return NotFound(new { Message = "Subscription not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(subscription.HouseholdId))
        {
            return Forbid();
        }

        var response = new SubscriptionResponseDto(
            subscription.Id,
            subscription.HouseholdId,
            subscription.AccountId,
            subscription.Account?.Name,
            subscription.CategoryId,
            subscription.Category?.Name,
            subscription.Name,
            subscription.Amount,
            subscription.BillingCycleId,
            subscription.BillingCycle.Name,
            subscription.NextBillingDate,
            subscription.IsActive ?? true,
            subscription.AutoRenew ?? true,
            subscription.MerchantWebsite,
            subscription.Notes,
            subscription.CreatedAt,
            subscription.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new subscription
    /// </summary>
    /// <param name="dto">Subscription creation details</param>
    /// <returns>Created subscription</returns>
    [HttpPost]
    [ProducesResponseType(typeof(SubscriptionResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Subscription name is required" });
        }

        if (dto.Amount <= 0)
        {
            return BadRequest(new { Message = "Subscription amount must be greater than zero" });
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

        // Verify billing cycle exists
        var billingCycleExists = await _context.Frequencies.AnyAsync(f => f.Id == dto.BillingCycleId);
        if (!billingCycleExists)
        {
            return BadRequest(new { Message = "Invalid billing cycle ID" });
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        // Create the subscription
        var subscription = new Subscriptions
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            AccountId = dto.AccountId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Amount = dto.Amount,
            BillingCycleId = dto.BillingCycleId,
            NextBillingDate = dto.NextBillingDate,
            IsActive = dto.IsActive,
            AutoRenew = dto.AutoRenew,
            MerchantWebsite = dto.MerchantWebsite,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();

        // Load related data for response
        var createdSubscription = await _context.Subscriptions
            .Include(s => s.Account)
            .Include(s => s.Category)
            .Include(s => s.BillingCycle)
            .FirstAsync(s => s.Id == subscription.Id);

        var response = new SubscriptionResponseDto(
            createdSubscription.Id,
            createdSubscription.HouseholdId,
            createdSubscription.AccountId,
            createdSubscription.Account?.Name,
            createdSubscription.CategoryId,
            createdSubscription.Category?.Name,
            createdSubscription.Name,
            createdSubscription.Amount,
            createdSubscription.BillingCycleId,
            createdSubscription.BillingCycle.Name,
            createdSubscription.NextBillingDate,
            createdSubscription.IsActive ?? true,
            createdSubscription.AutoRenew ?? true,
            createdSubscription.MerchantWebsite,
            createdSubscription.Notes,
            createdSubscription.CreatedAt,
            createdSubscription.UpdatedAt
        );

        return CreatedAtAction(nameof(GetSubscription), new { id = subscription.Id }, response);
    }

    /// <summary>
    /// Update an existing subscription
    /// </summary>
    /// <param name="id">The subscription ID</param>
    /// <param name="dto">Updated subscription details</param>
    /// <returns>Updated subscription</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(SubscriptionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionDto dto)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.Account)
            .Include(s => s.Category)
            .Include(s => s.BillingCycle)
            .Where(s => s.Id == id && s.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (subscription == null)
        {
            return NotFound(new { Message = "Subscription not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(subscription.HouseholdId))
        {
            return Forbid();
        }

        // Update fields (only if provided in DTO)
        if (dto.AccountId.HasValue)
        {
            var account = await _context.Accounts
                .Where(a => a.Id == dto.AccountId.Value && a.DeletedAt == null)
                .FirstOrDefaultAsync();

            if (account == null || account.HouseholdId != subscription.HouseholdId)
            {
                return BadRequest(new { Message = "Invalid account ID" });
            }
            subscription.AccountId = dto.AccountId.Value;
        }

        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
            subscription.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Name != null)
            subscription.Name = dto.Name;

        if (dto.Amount.HasValue)
        {
            if (dto.Amount.Value <= 0)
            {
                return BadRequest(new { Message = "Subscription amount must be greater than zero" });
            }
            subscription.Amount = dto.Amount.Value;
        }

        if (dto.BillingCycleId.HasValue)
        {
            var billingCycleExists = await _context.Frequencies.AnyAsync(f => f.Id == dto.BillingCycleId.Value);
            if (!billingCycleExists)
            {
                return BadRequest(new { Message = "Invalid billing cycle ID" });
            }
            subscription.BillingCycleId = dto.BillingCycleId.Value;
        }

        if (dto.NextBillingDate.HasValue)
            subscription.NextBillingDate = dto.NextBillingDate.Value;

        if (dto.IsActive.HasValue)
            subscription.IsActive = dto.IsActive.Value;

        if (dto.AutoRenew.HasValue)
            subscription.AutoRenew = dto.AutoRenew.Value;

        if (dto.MerchantWebsite != null)
            subscription.MerchantWebsite = dto.MerchantWebsite;

        if (dto.Notes != null)
            subscription.Notes = dto.Notes;

        subscription.UpdatedAt = DateTime.UtcNow;
        subscription.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        // Reload to get updated relationships
        await _context.Entry(subscription).Reference(s => s.Account).LoadAsync();
        await _context.Entry(subscription).Reference(s => s.Category).LoadAsync();
        await _context.Entry(subscription).Reference(s => s.BillingCycle).LoadAsync();

        var response = new SubscriptionResponseDto(
            subscription.Id,
            subscription.HouseholdId,
            subscription.AccountId,
            subscription.Account?.Name,
            subscription.CategoryId,
            subscription.Category?.Name,
            subscription.Name,
            subscription.Amount,
            subscription.BillingCycleId,
            subscription.BillingCycle.Name,
            subscription.NextBillingDate,
            subscription.IsActive ?? true,
            subscription.AutoRenew ?? true,
            subscription.MerchantWebsite,
            subscription.Notes,
            subscription.CreatedAt,
            subscription.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Renew a subscription (update next billing date)
    /// </summary>
    /// <param name="id">The subscription ID</param>
    /// <returns>Updated subscription</returns>
    [HttpPost("{id}/renew")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RenewSubscription(Guid id)
    {
        var subscription = await _context.Subscriptions
            .Include(s => s.BillingCycle)
            .Where(s => s.Id == id && s.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (subscription == null)
        {
            return NotFound(new { Message = "Subscription not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(subscription.HouseholdId))
        {
            return Forbid();
        }

        // Calculate next billing date based on billing cycle
        var intervalDays = subscription.BillingCycle.IntervalDays;
        subscription.NextBillingDate = subscription.NextBillingDate.AddDays(intervalDays);
        subscription.UpdatedAt = DateTime.UtcNow;
        subscription.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Subscription renewed successfully",
            SubscriptionId = subscription.Id,
            NextBillingDate = subscription.NextBillingDate
        });
    }

    /// <summary>
    /// Cancel a subscription (mark as inactive)
    /// </summary>
    /// <param name="id">The subscription ID</param>
    /// <returns>No content</returns>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelSubscription(Guid id)
    {
        var subscription = await _context.Subscriptions
            .Where(s => s.Id == id && s.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (subscription == null)
        {
            return NotFound(new { Message = "Subscription not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(subscription.HouseholdId))
        {
            return Forbid();
        }

        subscription.IsActive = false;
        subscription.AutoRenew = false;
        subscription.UpdatedAt = DateTime.UtcNow;
        subscription.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Subscription cancelled successfully",
            SubscriptionId = subscription.Id,
            Status = "Inactive"
        });
    }

    /// <summary>
    /// Delete a subscription (soft delete)
    /// </summary>
    /// <param name="id">The subscription ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSubscription(Guid id)
    {
        var subscription = await _context.Subscriptions
            .Where(s => s.Id == id && s.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (subscription == null)
        {
            return NotFound(new { Message = "Subscription not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(subscription.HouseholdId))
        {
            return Forbid();
        }

        // Soft delete
        subscription.DeletedAt = DateTime.UtcNow;
        subscription.UpdatedAt = DateTime.UtcNow;
        subscription.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get subscription summary for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>Subscription summary with statistics</returns>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(SubscriptionSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetSubscriptionSummary(Guid householdId)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var subscriptions = await _context.Subscriptions
            .Include(s => s.Category)
            .Include(s => s.BillingCycle)
            .Where(s => s.HouseholdId == householdId && s.DeletedAt == null)
            .ToListAsync();

        var totalSubscriptions = subscriptions.Count;
        var activeSubscriptions = subscriptions.Count(s => s.IsActive == true);
        var inactiveSubscriptions = subscriptions.Count(s => s.IsActive == false);

        // Calculate monthly and yearly totals
        decimal totalMonthlyAmount = 0;
        foreach (var sub in subscriptions.Where(s => s.IsActive == true))
        {
            var intervalDays = sub.BillingCycle.IntervalDays;
            var monthlyEquivalent = (sub.Amount / intervalDays) * 30; // Approximate monthly
            totalMonthlyAmount += monthlyEquivalent;
        }

        var totalYearlyAmount = totalMonthlyAmount * 12;

        // Get upcoming renewals (next 30 days)
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next30Days = today.AddDays(30);

        var upcomingRenewals = subscriptions
            .Where(s => s.IsActive == true 
                     && s.NextBillingDate >= today 
                     && s.NextBillingDate <= next30Days)
            .OrderBy(s => s.NextBillingDate)
            .Select(s => new UpcomingRenewalDto(
                s.Id,
                s.Name,
                s.Amount,
                s.NextBillingDate,
                s.NextBillingDate.DayNumber - today.DayNumber,
                s.BillingCycle.Name,
                s.AutoRenew ?? true
            ))
            .ToList();

        // Group by category
        var byCategory = subscriptions
            .Where(s => s.IsActive == true)
            .GroupBy(s => new { s.CategoryId, CategoryName = s.Category != null ? s.Category.Name : "Uncategorized" })
            .Select(g => new CategorySubscriptionDto(
                g.Key.CategoryId,
                g.Key.CategoryName,
                g.Count(),
                g.Sum(s => s.Amount)
            ))
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        var summary = new SubscriptionSummaryDto(
            totalSubscriptions,
            activeSubscriptions,
            inactiveSubscriptions,
            totalMonthlyAmount,
            totalYearlyAmount,
            upcomingRenewals,
            byCategory
        );

        return Ok(summary);
    }
}

