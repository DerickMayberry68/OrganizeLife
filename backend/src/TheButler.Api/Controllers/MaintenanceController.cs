using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing home maintenance tasks
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MaintenanceController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public MaintenanceController(TheButlerDbContext context)
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

    #region CRUD Operations

    /// <summary>
    /// Get all maintenance tasks for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="status">Optional status filter (Pending, In Progress, Completed, Cancelled)</param>
    /// <param name="includeCompleted">Include completed tasks (default: true)</param>
    /// <returns>List of maintenance tasks</returns>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<MaintenanceTaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdMaintenanceTasks(
        Guid householdId,
        [FromQuery] string? status = null,
        [FromQuery] bool includeCompleted = true)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.MaintenanceTasks
            .Include(mt => mt.ServiceProvider)
            .Include(mt => mt.Category)
            .Include(mt => mt.Priority)
            .Include(mt => mt.Frequency)
            .Where(mt => mt.HouseholdId == householdId && mt.DeletedAt == null);

        // Apply filters
        if (!includeCompleted)
            query = query.Where(mt => mt.Status != "Completed");

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(mt => mt.Status == status);

        var tasks = await query
            .OrderBy(mt => mt.DueDate)
            .ThenBy(mt => mt.Title)
            .Select(mt => new MaintenanceTaskResponseDto(
                mt.Id,
                mt.HouseholdId,
                mt.ServiceProviderId,
                mt.ServiceProvider != null ? mt.ServiceProvider.Name : null,
                mt.CategoryId,
                mt.Category != null ? mt.Category.Name : null,
                mt.PriorityId,
                mt.Priority != null ? mt.Priority.Name : null,
                mt.Title,
                mt.Description,
                mt.Status,
                mt.DueDate,
                mt.CompletedDate,
                mt.EstimatedCost,
                mt.ActualCost,
                mt.IsRecurring ?? false,
                mt.FrequencyId,
                mt.Frequency != null ? mt.Frequency.Name : null,
                mt.Location,
                mt.Notes,
                mt.CreatedAt,
                mt.UpdatedAt
            ))
            .ToListAsync();

        return Ok(tasks);
    }

    /// <summary>
    /// Get a specific maintenance task by ID
    /// </summary>
    /// <param name="id">The maintenance task ID</param>
    /// <returns>Maintenance task details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MaintenanceTaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMaintenanceTask(Guid id)
    {
        var task = await _context.MaintenanceTasks
            .Include(mt => mt.ServiceProvider)
            .Include(mt => mt.Category)
            .Include(mt => mt.Priority)
            .Include(mt => mt.Frequency)
            .Where(mt => mt.Id == id && mt.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (task == null)
        {
            return NotFound(new { Message = "Maintenance task not found" });
        }

        if (!await IsUserMemberOfHousehold(task.HouseholdId))
        {
            return Forbid();
        }

        var response = new MaintenanceTaskResponseDto(
            task.Id,
            task.HouseholdId,
            task.ServiceProviderId,
            task.ServiceProvider?.Name,
            task.CategoryId,
            task.Category?.Name,
            task.PriorityId,
            task.Priority?.Name,
            task.Title,
            task.Description,
            task.Status,
            task.DueDate,
            task.CompletedDate,
            task.EstimatedCost,
            task.ActualCost,
            task.IsRecurring ?? false,
            task.FrequencyId,
            task.Frequency?.Name,
            task.Location,
            task.Notes,
            task.CreatedAt,
            task.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new maintenance task
    /// </summary>
    /// <param name="dto">Maintenance task creation details</param>
    /// <returns>Created maintenance task</returns>
    [HttpPost]
    [ProducesResponseType(typeof(MaintenanceTaskResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMaintenanceTask([FromBody] CreateMaintenanceTaskDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { Message = "Title is required" });
        }

        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        // Verify service provider if specified
        if (dto.ServiceProviderId.HasValue)
        {
            var providerExists = await _context.ServiceProviders
                .AnyAsync(sp => sp.Id == dto.ServiceProviderId.Value && sp.IsActive == true);
            if (!providerExists)
            {
                return BadRequest(new { Message = "Invalid service provider ID" });
            }
        }

        // Verify category if specified
        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
        }

        // Verify priority if specified
        if (dto.PriorityId.HasValue)
        {
            var priorityExists = await _context.Priorities
                .AnyAsync(p => p.Id == dto.PriorityId.Value);
            if (!priorityExists)
            {
                return BadRequest(new { Message = "Invalid priority ID" });
            }
        }

        // Verify frequency if specified
        if (dto.FrequencyId.HasValue)
        {
            var frequencyExists = await _context.Frequencies
                .AnyAsync(f => f.Id == dto.FrequencyId.Value);
            if (!frequencyExists)
            {
                return BadRequest(new { Message = "Invalid frequency ID" });
            }
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var task = new MaintenanceTasks
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            ServiceProviderId = dto.ServiceProviderId,
            CategoryId = dto.CategoryId,
            PriorityId = dto.PriorityId,
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            DueDate = dto.DueDate,
            EstimatedCost = dto.EstimatedCost,
            IsRecurring = dto.IsRecurring,
            FrequencyId = dto.FrequencyId,
            Location = dto.Location,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.MaintenanceTasks.Add(task);
        await _context.SaveChangesAsync();

        // Load related data for response
        var createdTask = await _context.MaintenanceTasks
            .Include(mt => mt.ServiceProvider)
            .Include(mt => mt.Category)
            .Include(mt => mt.Priority)
            .Include(mt => mt.Frequency)
            .FirstAsync(mt => mt.Id == task.Id);

        var response = new MaintenanceTaskResponseDto(
            createdTask.Id,
            createdTask.HouseholdId,
            createdTask.ServiceProviderId,
            createdTask.ServiceProvider?.Name,
            createdTask.CategoryId,
            createdTask.Category?.Name,
            createdTask.PriorityId,
            createdTask.Priority?.Name,
            createdTask.Title,
            createdTask.Description,
            createdTask.Status,
            createdTask.DueDate,
            createdTask.CompletedDate,
            createdTask.EstimatedCost,
            createdTask.ActualCost,
            createdTask.IsRecurring ?? false,
            createdTask.FrequencyId,
            createdTask.Frequency?.Name,
            createdTask.Location,
            createdTask.Notes,
            createdTask.CreatedAt,
            createdTask.UpdatedAt
        );

        return CreatedAtAction(nameof(GetMaintenanceTask), new { id = task.Id }, response);
    }

    /// <summary>
    /// Update an existing maintenance task
    /// </summary>
    /// <param name="id">The maintenance task ID</param>
    /// <param name="dto">Updated maintenance task details</param>
    /// <returns>Updated maintenance task</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MaintenanceTaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMaintenanceTask(Guid id, [FromBody] UpdateMaintenanceTaskDto dto)
    {
        var task = await _context.MaintenanceTasks
            .Include(mt => mt.ServiceProvider)
            .Include(mt => mt.Category)
            .Include(mt => mt.Priority)
            .Include(mt => mt.Frequency)
            .Where(mt => mt.Id == id && mt.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (task == null)
        {
            return NotFound(new { Message = "Maintenance task not found" });
        }

        if (!await IsUserMemberOfHousehold(task.HouseholdId))
        {
            return Forbid();
        }

        // Update fields (only if provided in DTO)
        if (dto.ServiceProviderId.HasValue)
        {
            var providerExists = await _context.ServiceProviders
                .AnyAsync(sp => sp.Id == dto.ServiceProviderId.Value && sp.IsActive == true);
            if (!providerExists)
            {
                return BadRequest(new { Message = "Invalid service provider ID" });
            }
            task.ServiceProviderId = dto.ServiceProviderId.Value;
        }

        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
            task.CategoryId = dto.CategoryId.Value;
        }

        if (dto.PriorityId.HasValue)
        {
            var priorityExists = await _context.Priorities
                .AnyAsync(p => p.Id == dto.PriorityId.Value);
            if (!priorityExists)
            {
                return BadRequest(new { Message = "Invalid priority ID" });
            }
            task.PriorityId = dto.PriorityId.Value;
        }

        if (dto.FrequencyId.HasValue)
        {
            var frequencyExists = await _context.Frequencies
                .AnyAsync(f => f.Id == dto.FrequencyId.Value);
            if (!frequencyExists)
            {
                return BadRequest(new { Message = "Invalid frequency ID" });
            }
            task.FrequencyId = dto.FrequencyId.Value;
        }

        if (dto.Title != null) task.Title = dto.Title;
        if (dto.Description != null) task.Description = dto.Description;
        if (dto.Status != null) task.Status = dto.Status;
        if (dto.DueDate.HasValue) task.DueDate = dto.DueDate.Value;
        if (dto.EstimatedCost.HasValue) task.EstimatedCost = dto.EstimatedCost;
        if (dto.ActualCost.HasValue) task.ActualCost = dto.ActualCost;
        if (dto.IsRecurring.HasValue) task.IsRecurring = dto.IsRecurring;
        if (dto.Location != null) task.Location = dto.Location;
        if (dto.Notes != null) task.Notes = dto.Notes;

        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        // Reload to get updated relationships
        await _context.Entry(task).Reference(mt => mt.ServiceProvider).LoadAsync();
        await _context.Entry(task).Reference(mt => mt.Category).LoadAsync();
        await _context.Entry(task).Reference(mt => mt.Priority).LoadAsync();
        await _context.Entry(task).Reference(mt => mt.Frequency).LoadAsync();

        var response = new MaintenanceTaskResponseDto(
            task.Id,
            task.HouseholdId,
            task.ServiceProviderId,
            task.ServiceProvider?.Name,
            task.CategoryId,
            task.Category?.Name,
            task.PriorityId,
            task.Priority?.Name,
            task.Title,
            task.Description,
            task.Status,
            task.DueDate,
            task.CompletedDate,
            task.EstimatedCost,
            task.ActualCost,
            task.IsRecurring ?? false,
            task.FrequencyId,
            task.Frequency?.Name,
            task.Location,
            task.Notes,
            task.CreatedAt,
            task.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a maintenance task (soft delete)
    /// </summary>
    /// <param name="id">The maintenance task ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMaintenanceTask(Guid id)
    {
        var task = await _context.MaintenanceTasks
            .Where(mt => mt.Id == id && mt.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (task == null)
        {
            return NotFound(new { Message = "Maintenance task not found" });
        }

        if (!await IsUserMemberOfHousehold(task.HouseholdId))
        {
            return Forbid();
        }

        // Soft delete
        task.DeletedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Mark a maintenance task as complete
    /// </summary>
    /// <param name="id">The maintenance task ID</param>
    /// <param name="dto">Completion details</param>
    /// <returns>Updated maintenance task</returns>
    [HttpPost("{id}/complete")]
    [ProducesResponseType(typeof(MaintenanceTaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CompleteMaintenanceTask(Guid id, [FromBody] CompleteMaintenanceTaskDto dto)
    {
        var task = await _context.MaintenanceTasks
            .Include(mt => mt.ServiceProvider)
            .Include(mt => mt.Category)
            .Include(mt => mt.Priority)
            .Include(mt => mt.Frequency)
            .Where(mt => mt.Id == id && mt.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (task == null)
        {
            return NotFound(new { Message = "Maintenance task not found" });
        }

        if (!await IsUserMemberOfHousehold(task.HouseholdId))
        {
            return Forbid();
        }

        // Update task as completed
        task.Status = "Completed";
        task.CompletedDate = dto.CompletedDate;
        if (dto.ActualCost.HasValue)
            task.ActualCost = dto.ActualCost.Value;
        if (!string.IsNullOrWhiteSpace(dto.Notes))
            task.Notes = string.IsNullOrWhiteSpace(task.Notes) ? dto.Notes : $"{task.Notes}\n\nCompleted: {dto.Notes}";
        
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new MaintenanceTaskResponseDto(
            task.Id,
            task.HouseholdId,
            task.ServiceProviderId,
            task.ServiceProvider?.Name,
            task.CategoryId,
            task.Category?.Name,
            task.PriorityId,
            task.Priority?.Name,
            task.Title,
            task.Description,
            task.Status,
            task.DueDate,
            task.CompletedDate,
            task.EstimatedCost,
            task.ActualCost,
            task.IsRecurring ?? false,
            task.FrequencyId,
            task.Frequency?.Name,
            task.Location,
            task.Notes,
            task.CreatedAt,
            task.UpdatedAt
        );

        return Ok(response);
    }

    #endregion

    #region Analytics & Reporting

    /// <summary>
    /// Get maintenance summary for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>Maintenance summary with statistics</returns>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(MaintenanceSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMaintenanceSummary(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var tasks = await _context.MaintenanceTasks
            .Include(mt => mt.Priority)
            .Where(mt => mt.HouseholdId == householdId && mt.DeletedAt == null)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next30Days = today.AddDays(30);

        var totalTasks = tasks.Count;
        var pendingTasks = tasks.Count(t => t.Status == "Pending");
        var inProgressTasks = tasks.Count(t => t.Status == "In Progress");
        var completedTasks = tasks.Count(t => t.Status == "Completed");
        var overdueTasks = tasks.Count(t => t.Status != "Completed" && t.DueDate < today);
        var totalEstimatedCost = tasks.Where(t => t.EstimatedCost.HasValue).Sum(t => t.EstimatedCost!.Value);
        var totalActualCost = tasks.Where(t => t.ActualCost.HasValue).Sum(t => t.ActualCost!.Value);

        var upcomingTasks = tasks
            .Where(t => t.Status != "Completed" && t.DueDate >= today && t.DueDate <= next30Days)
            .OrderBy(t => t.DueDate)
            .Take(10)
            .Select(t => new UpcomingMaintenanceDto(
                t.Id,
                t.Title,
                t.DueDate,
                t.DueDate.DayNumber - today.DayNumber,
                t.Status,
                t.Priority?.Name,
                t.EstimatedCost,
                t.Location
            ))
            .ToList();

        var nextDueDate = tasks
            .Where(t => t.Status != "Completed" && t.DueDate >= today)
            .OrderBy(t => t.DueDate)
            .Select(t => (DateOnly?)t.DueDate)
            .FirstOrDefault();

        var summary = new MaintenanceSummaryDto(
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks,
            overdueTasks,
            totalEstimatedCost,
            totalActualCost,
            nextDueDate,
            upcomingTasks
        );

        return Ok(summary);
    }

    /// <summary>
    /// Get overdue maintenance tasks for a household
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <returns>List of overdue maintenance tasks</returns>
    [HttpGet("household/{householdId}/overdue")]
    [ProducesResponseType(typeof(List<OverdueMaintenanceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOverdueTasks(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var overdueTasks = await _context.MaintenanceTasks
            .Include(mt => mt.Priority)
            .Include(mt => mt.ServiceProvider)
            .Where(mt => mt.HouseholdId == householdId 
                      && mt.DeletedAt == null
                      && mt.Status != "Completed"
                      && mt.DueDate < today)
            .OrderBy(mt => mt.DueDate)
            .Select(mt => new OverdueMaintenanceDto(
                mt.Id,
                mt.Title,
                mt.DueDate,
                today.DayNumber - mt.DueDate.DayNumber,
                mt.Status,
                mt.Priority != null ? mt.Priority.Name : null,
                mt.EstimatedCost,
                mt.ServiceProvider != null ? mt.ServiceProvider.Name : null
            ))
            .ToListAsync();

        return Ok(overdueTasks);
    }

    /// <summary>
    /// Get maintenance cost analysis
    /// </summary>
    /// <param name="householdId">The household ID</param>
    /// <param name="months">Number of months to analyze (default: 12)</param>
    /// <returns>Maintenance cost analysis</returns>
    [HttpGet("household/{householdId}/cost-analysis")]
    [ProducesResponseType(typeof(MaintenanceCostAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetCostAnalysis(Guid householdId, [FromQuery] int months = 12)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddMonths(-months));

        var tasks = await _context.MaintenanceTasks
            .Where(mt => mt.HouseholdId == householdId 
                      && mt.DeletedAt == null
                      && mt.DueDate >= startDate)
            .ToListAsync();

        var totalEstimated = tasks.Where(t => t.EstimatedCost.HasValue).Sum(t => t.EstimatedCost!.Value);
        var totalActual = tasks.Where(t => t.ActualCost.HasValue).Sum(t => t.ActualCost!.Value);
        var variance = totalActual - totalEstimated;
        var avgEstimated = tasks.Where(t => t.EstimatedCost.HasValue).Any() 
            ? tasks.Where(t => t.EstimatedCost.HasValue).Average(t => t.EstimatedCost!.Value) 
            : 0;
        var avgActual = tasks.Where(t => t.ActualCost.HasValue).Any()
            ? tasks.Where(t => t.ActualCost.HasValue).Average(t => t.ActualCost!.Value)
            : 0;

        var monthlyBreakdown = tasks
            .GroupBy(t => new { t.DueDate.Year, t.DueDate.Month })
            .Select(g => new MonthlyMaintenanceCostDto(
                g.Key.Year,
                g.Key.Month,
                new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                g.Where(t => t.EstimatedCost.HasValue).Sum(t => t.EstimatedCost!.Value),
                g.Where(t => t.ActualCost.HasValue).Sum(t => t.ActualCost!.Value),
                g.Count()
            ))
            .OrderBy(m => m.Year)
            .ThenBy(m => m.Month)
            .ToList();

        var analysis = new MaintenanceCostAnalysisDto(
            totalEstimated,
            totalActual,
            variance,
            avgEstimated,
            avgActual,
            monthlyBreakdown
        );

        return Ok(analysis);
    }

    #endregion
}

