using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing budgets and budget performance tracking
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BudgetsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public BudgetsController(TheButlerDbContext context)
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
    /// Calculate budget performance for a given period
    /// </summary>
    private async Task<BudgetPerformanceDto> CalculateBudgetPerformance(
        Budgets budget, 
        DateOnly periodStart, 
        DateOnly periodEnd)
    {
        // Get transactions for this category in the period
        var transactions = await _context.Transactions
            .Where(t => t.HouseholdId == budget.HouseholdId
                     && t.CategoryId == budget.CategoryId
                     && t.Type == "Expense"
                     && t.Date >= periodStart
                     && t.Date <= periodEnd
                     && t.DeletedAt == null)
            .ToListAsync();

        var spentAmount = transactions.Sum(t => t.Amount);
        var remainingAmount = budget.LimitAmount - spentAmount;
        var percentageUsed = budget.LimitAmount > 0 ? (spentAmount / budget.LimitAmount) * 100 : 0;

        string status;
        if (percentageUsed >= 100)
            status = "Over Budget";
        else if (percentageUsed >= 80)
            status = "Near Limit";
        else
            status = "Under Budget";

        return new BudgetPerformanceDto(
            budget.Id,
            budget.Name,
            budget.CategoryId,
            budget.Category.Name,
            budget.LimitAmount,
            spentAmount,
            remainingAmount,
            percentageUsed,
            status,
            periodStart,
            periodEnd,
            transactions.Count
        );
    }

    /// <summary>
    /// Get all budgets for a specific household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="isActive">Optional filter for active budgets</param>
    /// <returns>List of budgets</returns>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<BudgetResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdBudgets(
        Guid householdId,
        [FromQuery] bool? isActive = null)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.HouseholdId == householdId && b.DeletedAt == null);

        if (isActive.HasValue)
            query = query.Where(b => b.IsActive == isActive.Value);

        var budgets = await query
            .OrderBy(b => b.Category.Name)
            .ThenBy(b => b.Name)
            .Select(b => new BudgetResponseDto(
                b.Id,
                b.HouseholdId,
                b.CategoryId,
                b.Category.Name,
                b.Name,
                b.LimitAmount,
                b.Period,
                b.StartDate,
                b.EndDate,
                b.IsActive ?? true,
                b.CreatedAt,
                b.UpdatedAt
            ))
            .ToListAsync();

        return Ok(budgets);
    }

    /// <summary>
    /// Get a specific budget by ID
    /// </summary>
    /// <param name="id">The budget ID</param>
    /// <returns>Budget details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BudgetResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBudget(Guid id)
    {
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (budget == null)
        {
            return NotFound(new { Message = "Budget not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(budget.HouseholdId))
        {
            return Forbid();
        }

        var response = new BudgetResponseDto(
            budget.Id,
            budget.HouseholdId,
            budget.CategoryId,
            budget.Category.Name,
            budget.Name,
            budget.LimitAmount,
            budget.Period,
            budget.StartDate,
            budget.EndDate,
            budget.IsActive ?? true,
            budget.CreatedAt,
            budget.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new budget
    /// </summary>
    /// <param name="dto">Budget creation details</param>
    /// <returns>Created budget</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BudgetResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Budget name is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Period))
        {
            return BadRequest(new { Message = "Budget period is required" });
        }

        if (dto.LimitAmount <= 0)
        {
            return BadRequest(new { Message = "Budget limit amount must be greater than zero" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        // Verify category exists
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
        {
            return BadRequest(new { Message = "Invalid category ID" });
        }

        // Check if budget already exists for this category
        var existingBudget = await _context.Budgets
            .AnyAsync(b => b.HouseholdId == dto.HouseholdId
                        && b.CategoryId == dto.CategoryId
                        && b.IsActive == true
                        && b.DeletedAt == null);

        if (existingBudget)
        {
            return BadRequest(new { Message = "An active budget already exists for this category" });
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        // Create the budget
        var budget = new Budgets
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            LimitAmount = dto.LimitAmount,
            Period = dto.Period,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        // Load related data for response
        var createdBudget = await _context.Budgets
            .Include(b => b.Category)
            .FirstAsync(b => b.Id == budget.Id);

        var response = new BudgetResponseDto(
            createdBudget.Id,
            createdBudget.HouseholdId,
            createdBudget.CategoryId,
            createdBudget.Category.Name,
            createdBudget.Name,
            createdBudget.LimitAmount,
            createdBudget.Period,
            createdBudget.StartDate,
            createdBudget.EndDate,
            createdBudget.IsActive ?? true,
            createdBudget.CreatedAt,
            createdBudget.UpdatedAt
        );

        return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, response);
    }

    /// <summary>
    /// Update an existing budget
    /// </summary>
    /// <param name="id">The budget ID</param>
    /// <param name="dto">Updated budget details</param>
    /// <returns>Updated budget</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BudgetResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBudget(Guid id, [FromBody] UpdateBudgetDto dto)
    {
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (budget == null)
        {
            return NotFound(new { Message = "Budget not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(budget.HouseholdId))
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
            budget.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Name != null)
            budget.Name = dto.Name;

        if (dto.LimitAmount.HasValue)
        {
            if (dto.LimitAmount.Value <= 0)
            {
                return BadRequest(new { Message = "Budget limit amount must be greater than zero" });
            }
            budget.LimitAmount = dto.LimitAmount.Value;
        }

        if (dto.Period != null)
            budget.Period = dto.Period;

        if (dto.StartDate.HasValue)
            budget.StartDate = dto.StartDate.Value;

        if (dto.EndDate.HasValue)
            budget.EndDate = dto.EndDate.Value;

        if (dto.IsActive.HasValue)
            budget.IsActive = dto.IsActive.Value;

        budget.UpdatedAt = DateTime.UtcNow;
        budget.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        // Reload to get updated relationships
        await _context.Entry(budget).Reference(b => b.Category).LoadAsync();

        var response = new BudgetResponseDto(
            budget.Id,
            budget.HouseholdId,
            budget.CategoryId,
            budget.Category.Name,
            budget.Name,
            budget.LimitAmount,
            budget.Period,
            budget.StartDate,
            budget.EndDate,
            budget.IsActive ?? true,
            budget.CreatedAt,
            budget.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a budget (soft delete)
    /// </summary>
    /// <param name="id">The budget ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        var budget = await _context.Budgets
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (budget == null)
        {
            return NotFound(new { Message = "Budget not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(budget.HouseholdId))
        {
            return Forbid();
        }

        // Soft delete
        budget.DeletedAt = DateTime.UtcNow;
        budget.UpdatedAt = DateTime.UtcNow;
        budget.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get budget performance for a specific budget
    /// </summary>
    /// <param name="id">The budget ID</param>
    /// <param name="startDate">Optional start date (defaults to budget start date)</param>
    /// <param name="endDate">Optional end date (defaults to today or budget end date)</param>
    /// <returns>Budget performance details</returns>
    [HttpGet("{id}/performance")]
    [ProducesResponseType(typeof(BudgetPerformanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBudgetPerformance(
        Guid id,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.Id == id && b.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (budget == null)
        {
            return NotFound(new { Message = "Budget not found" });
        }

        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(budget.HouseholdId))
        {
            return Forbid();
        }

        // Determine period
        var periodStart = startDate ?? budget.StartDate;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var periodEnd = endDate ?? (budget.EndDate.HasValue ? 
            (budget.EndDate.Value < today ? budget.EndDate.Value : today) : 
            today);

        var performance = await CalculateBudgetPerformance(budget, periodStart, periodEnd);

        return Ok(performance);
    }

    /// <summary>
    /// Get budget summary for entire household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="startDate">Optional start date for performance calculation</param>
    /// <param name="endDate">Optional end date for performance calculation</param>
    /// <returns>Household budget summary with all budget performances</returns>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(BudgetSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBudgetSummary(
        Guid householdId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.HouseholdId == householdId && b.DeletedAt == null)
            .ToListAsync();

        var activeBudgets = budgets.Where(b => b.IsActive == true).ToList();

        // Calculate performance for each budget
        var budgetPerformances = new List<BudgetPerformanceDto>();
        foreach (var budget in activeBudgets)
        {
            var periodStart = startDate ?? budget.StartDate;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var periodEnd = endDate ?? (budget.EndDate.HasValue ? 
                (budget.EndDate.Value < today ? budget.EndDate.Value : today) : 
                today);

            var performance = await CalculateBudgetPerformance(budget, periodStart, periodEnd);
            budgetPerformances.Add(performance);
        }

        var totalBudgeted = budgetPerformances.Sum(p => p.LimitAmount);
        var totalSpent = budgetPerformances.Sum(p => p.SpentAmount);
        var totalRemaining = budgetPerformances.Sum(p => p.RemainingAmount);
        var overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
        var budgetsOverLimit = budgetPerformances.Count(p => p.Status == "Over Budget");

        var summary = new BudgetSummaryDto(
            budgets.Count,
            activeBudgets.Count,
            totalBudgeted,
            totalSpent,
            totalRemaining,
            overallPercentage,
            budgetsOverLimit,
            budgetPerformances.OrderByDescending(p => p.PercentageUsed).ToList()
        );

        return Ok(summary);
    }

    /// <summary>
    /// Get budgets that are over limit or near limit
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>List of budgets that need attention</returns>
    [HttpGet("household/{householdId}/alerts")]
    [ProducesResponseType(typeof(List<BudgetPerformanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetBudgetAlerts(Guid householdId)
    {
        // Verify user has access to this household
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.HouseholdId == householdId 
                     && b.IsActive == true 
                     && b.DeletedAt == null)
            .ToListAsync();

        var alerts = new List<BudgetPerformanceDto>();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var budget in budgets)
        {
            var periodStart = budget.StartDate;
            var periodEnd = budget.EndDate.HasValue ? 
                (budget.EndDate.Value < today ? budget.EndDate.Value : today) : 
                today;

            var performance = await CalculateBudgetPerformance(budget, periodStart, periodEnd);

            // Only include budgets that are near limit or over budget
            if (performance.Status == "Near Limit" || performance.Status == "Over Budget")
            {
                alerts.Add(performance);
            }
        }

        return Ok(alerts.OrderByDescending(a => a.PercentageUsed).ToList());
    }
}

