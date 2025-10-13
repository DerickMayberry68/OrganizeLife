using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing financial goals (savings targets, debt payoff, etc.)
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FinancialGoalsController : ControllerBase
{
    private readonly TheButlerDbContext _context;
    private readonly ILogger<FinancialGoalsController> _logger;

    public FinancialGoalsController(TheButlerDbContext context, ILogger<FinancialGoalsController> logger)
    {
        _context = context;
        _logger = logger;
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

    /// <summary>
    /// Get all financial goals for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<FinancialGoalResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdGoals(Guid householdId, [FromQuery] bool? isAchieved = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
            return Forbid();

        var query = _context.FinancialGoals
            .Where(fg => fg.HouseholdId == householdId && fg.DeletedAt == null);

        if (isAchieved.HasValue)
            query = query.Where(fg => fg.IsAchieved == isAchieved.Value);

        var goals = await query
            .OrderByDescending(fg => fg.IsAchieved == false)
            .ThenBy(fg => fg.Deadline)
            .Select(fg => new FinancialGoalResponseDto
            {
                Id = fg.Id,
                HouseholdId = fg.HouseholdId,
                Name = fg.Name,
                Description = fg.Description,
                TargetAmount = fg.TargetAmount,
                CurrentAmount = fg.CurrentAmount,
                PercentageComplete = fg.TargetAmount > 0 ? (fg.CurrentAmount / fg.TargetAmount * 100) : 0,
                RemainingAmount = fg.TargetAmount - fg.CurrentAmount,
                Deadline = fg.Deadline,
                PriorityId = fg.PriorityId,
                IsAchieved = fg.IsAchieved ?? false,
                AchievedDate = fg.AchievedDate,
                CreatedAt = fg.CreatedAt,
                UpdatedAt = fg.UpdatedAt
            })
            .ToListAsync();

        return Ok(goals);
    }

    /// <summary>
    /// Get a specific financial goal by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FinancialGoalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var goal = await _context.FinancialGoals
            .Where(fg => fg.Id == id && fg.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (goal == null)
            return NotFound(new { message = "Financial goal not found" });

        if (!await IsUserMemberOfHousehold(goal.HouseholdId))
            return Forbid();

        var response = new FinancialGoalResponseDto
        {
            Id = goal.Id,
            HouseholdId = goal.HouseholdId,
            Name = goal.Name,
            Description = goal.Description,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            PercentageComplete = goal.TargetAmount > 0 ? (goal.CurrentAmount / goal.TargetAmount * 100) : 0,
            RemainingAmount = goal.TargetAmount - goal.CurrentAmount,
            Deadline = goal.Deadline,
            PriorityId = goal.PriorityId,
            IsAchieved = goal.IsAchieved ?? false,
            AchievedDate = goal.AchievedDate,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Create a new financial goal
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(FinancialGoalResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateFinancialGoalDto dto)
    {
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var goal = new FinancialGoals
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            Name = dto.Name,
            Description = dto.Description,
            TargetAmount = dto.TargetAmount,
            CurrentAmount = dto.CurrentAmount ?? 0,
            Deadline = dto.Deadline,
            PriorityId = dto.PriorityId,
            IsAchieved = false,
            CreatedAt = now,
            CreatedBy = userId,
            UpdatedAt = now,
            UpdatedBy = userId
        };

        _context.FinancialGoals.Add(goal);
        await _context.SaveChangesAsync();

        var response = new FinancialGoalResponseDto
        {
            Id = goal.Id,
            HouseholdId = goal.HouseholdId,
            Name = goal.Name,
            Description = goal.Description,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            PercentageComplete = goal.TargetAmount > 0 ? (goal.CurrentAmount / goal.TargetAmount * 100) : 0,
            RemainingAmount = goal.TargetAmount - goal.CurrentAmount,
            Deadline = goal.Deadline,
            PriorityId = goal.PriorityId,
            IsAchieved = goal.IsAchieved ?? false,
            AchievedDate = goal.AchievedDate,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = goal.Id }, response);
    }

    /// <summary>
    /// Update a financial goal
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(FinancialGoalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFinancialGoalDto dto)
    {
        var goal = await _context.FinancialGoals
            .Where(fg => fg.Id == id && fg.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (goal == null)
            return NotFound(new { message = "Financial goal not found" });

        if (!await IsUserMemberOfHousehold(goal.HouseholdId))
            return Forbid();

        var userId = GetCurrentUserId();

        if (dto.Name != null) goal.Name = dto.Name;
        if (dto.Description != null) goal.Description = dto.Description;
        if (dto.TargetAmount.HasValue) goal.TargetAmount = dto.TargetAmount.Value;
        if (dto.CurrentAmount.HasValue) goal.CurrentAmount = dto.CurrentAmount.Value;
        if (dto.Deadline.HasValue) goal.Deadline = dto.Deadline;
        if (dto.PriorityId.HasValue) goal.PriorityId = dto.PriorityId;

        // Auto-mark as achieved if current >= target
        if (goal.CurrentAmount >= goal.TargetAmount && goal.IsAchieved == false)
        {
            goal.IsAchieved = true;
            goal.AchievedDate = DateOnly.FromDateTime(DateTime.UtcNow);
        }

        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        var response = new FinancialGoalResponseDto
        {
            Id = goal.Id,
            HouseholdId = goal.HouseholdId,
            Name = goal.Name,
            Description = goal.Description,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            PercentageComplete = goal.TargetAmount > 0 ? (goal.CurrentAmount / goal.TargetAmount * 100) : 0,
            RemainingAmount = goal.TargetAmount - goal.CurrentAmount,
            Deadline = goal.Deadline,
            PriorityId = goal.PriorityId,
            IsAchieved = goal.IsAchieved ?? false,
            AchievedDate = goal.AchievedDate,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Update progress on a financial goal
    /// </summary>
    [HttpPost("{id}/progress")]
    [ProducesResponseType(typeof(FinancialGoalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProgress(Guid id, [FromBody] UpdateProgressDto dto)
    {
        var goal = await _context.FinancialGoals
            .Where(fg => fg.Id == id && fg.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (goal == null)
            return NotFound(new { message = "Financial goal not found" });

        if (!await IsUserMemberOfHousehold(goal.HouseholdId))
            return Forbid();

        goal.CurrentAmount += dto.AmountToAdd;

        // Auto-mark as achieved if current >= target
        if (goal.CurrentAmount >= goal.TargetAmount && goal.IsAchieved == false)
        {
            goal.IsAchieved = true;
            goal.AchievedDate = DateOnly.FromDateTime(DateTime.UtcNow);
        }

        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new FinancialGoalResponseDto
        {
            Id = goal.Id,
            HouseholdId = goal.HouseholdId,
            Name = goal.Name,
            Description = goal.Description,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = goal.CurrentAmount,
            PercentageComplete = goal.TargetAmount > 0 ? (goal.CurrentAmount / goal.TargetAmount * 100) : 0,
            RemainingAmount = goal.TargetAmount - goal.CurrentAmount,
            Deadline = goal.Deadline,
            PriorityId = goal.PriorityId,
            IsAchieved = goal.IsAchieved ?? false,
            AchievedDate = goal.AchievedDate,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Delete a financial goal (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var goal = await _context.FinancialGoals
            .Where(fg => fg.Id == id && fg.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (goal == null)
            return NotFound(new { message = "Financial goal not found" });

        if (!await IsUserMemberOfHousehold(goal.HouseholdId))
            return Forbid();

        goal.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record FinancialGoalResponseDto
{
    public Guid Id { get; init; }
    public Guid HouseholdId { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public decimal TargetAmount { get; init; }
    public decimal CurrentAmount { get; init; }
    public decimal PercentageComplete { get; init; }
    public decimal RemainingAmount { get; init; }
    public DateOnly? Deadline { get; init; }
    public Guid? PriorityId { get; init; }
    public bool IsAchieved { get; init; }
    public DateOnly? AchievedDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateFinancialGoalDto
{
    public Guid HouseholdId { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public decimal TargetAmount { get; init; }
    public decimal? CurrentAmount { get; init; }
    public DateOnly? Deadline { get; init; }
    public Guid? PriorityId { get; init; }
}

public record UpdateFinancialGoalDto
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public decimal? TargetAmount { get; init; }
    public decimal? CurrentAmount { get; init; }
    public DateOnly? Deadline { get; init; }
    public Guid? PriorityId { get; init; }
}

public record UpdateProgressDto
{
    public decimal AmountToAdd { get; init; }
}

