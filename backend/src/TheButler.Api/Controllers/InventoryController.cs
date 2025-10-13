using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing household inventory items
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public InventoryController(TheButlerDbContext context)
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

    /// <summary>
    /// Get all inventory items for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<InventoryItemResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdInventory(
        Guid householdId,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? location = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.InventoryItems
            .Include(ii => ii.Category)
            .Where(ii => ii.HouseholdId == householdId && ii.DeletedAt == null);

        if (categoryId.HasValue)
            query = query.Where(ii => ii.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(location))
            query = query.Where(ii => ii.Location.Contains(location));

        var items = await query
            .OrderBy(ii => ii.Name)
            .Select(ii => new InventoryItemResponseDto(
                ii.Id,
                ii.HouseholdId,
                ii.CategoryId,
                ii.Category != null ? ii.Category.Name : null,
                ii.Name,
                ii.Description,
                ii.PurchaseDate,
                ii.PurchasePrice,
                ii.CurrentValue,
                ii.Location,
                ii.SerialNumber,
                ii.ModelNumber,
                ii.Manufacturer,
                ii.PhotoUrls,
                ii.Notes,
                ii.CreatedAt,
                ii.UpdatedAt
            ))
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Get a specific inventory item by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InventoryItemResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInventoryItem(Guid id)
    {
        var item = await _context.InventoryItems
            .Include(ii => ii.Category)
            .Where(ii => ii.Id == id && ii.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
        {
            return NotFound(new { Message = "Inventory item not found" });
        }

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
        {
            return Forbid();
        }

        var response = new InventoryItemResponseDto(
            item.Id,
            item.HouseholdId,
            item.CategoryId,
            item.Category?.Name,
            item.Name,
            item.Description,
            item.PurchaseDate,
            item.PurchasePrice,
            item.CurrentValue,
            item.Location,
            item.SerialNumber,
            item.ModelNumber,
            item.Manufacturer,
            item.PhotoUrls,
            item.Notes,
            item.CreatedAt,
            item.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new inventory item
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(InventoryItemResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateInventoryItem([FromBody] CreateInventoryItemDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Name is required" });
        }

        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

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

        var item = new InventoryItems
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            PurchaseDate = dto.PurchaseDate,
            PurchasePrice = dto.PurchasePrice,
            CurrentValue = dto.CurrentValue,
            Location = dto.Location,
            SerialNumber = dto.SerialNumber,
            ModelNumber = dto.ModelNumber,
            Manufacturer = dto.Manufacturer,
            PhotoUrls = dto.PhotoUrls,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();

        var createdItem = await _context.InventoryItems
            .Include(ii => ii.Category)
            .FirstAsync(ii => ii.Id == item.Id);

        var response = new InventoryItemResponseDto(
            createdItem.Id,
            createdItem.HouseholdId,
            createdItem.CategoryId,
            createdItem.Category?.Name,
            createdItem.Name,
            createdItem.Description,
            createdItem.PurchaseDate,
            createdItem.PurchasePrice,
            createdItem.CurrentValue,
            createdItem.Location,
            createdItem.SerialNumber,
            createdItem.ModelNumber,
            createdItem.Manufacturer,
            createdItem.PhotoUrls,
            createdItem.Notes,
            createdItem.CreatedAt,
            createdItem.UpdatedAt
        );

        return CreatedAtAction(nameof(GetInventoryItem), new { id = item.Id }, response);
    }

    /// <summary>
    /// Update an existing inventory item
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(InventoryItemResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInventoryItem(Guid id, [FromBody] UpdateInventoryItemDto dto)
    {
        var item = await _context.InventoryItems
            .Include(ii => ii.Category)
            .Where(ii => ii.Id == id && ii.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
        {
            return NotFound(new { Message = "Inventory item not found" });
        }

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
        {
            return Forbid();
        }

        if (dto.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { Message = "Invalid category ID" });
            }
            item.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Name != null) item.Name = dto.Name;
        if (dto.Description != null) item.Description = dto.Description;
        if (dto.PurchaseDate.HasValue) item.PurchaseDate = dto.PurchaseDate.Value;
        if (dto.PurchasePrice.HasValue) item.PurchasePrice = dto.PurchasePrice.Value;
        if (dto.CurrentValue.HasValue) item.CurrentValue = dto.CurrentValue;
        if (dto.Location != null) item.Location = dto.Location;
        if (dto.SerialNumber != null) item.SerialNumber = dto.SerialNumber;
        if (dto.ModelNumber != null) item.ModelNumber = dto.ModelNumber;
        if (dto.Manufacturer != null) item.Manufacturer = dto.Manufacturer;
        if (dto.PhotoUrls != null) item.PhotoUrls = dto.PhotoUrls;
        if (dto.Notes != null) item.Notes = dto.Notes;

        item.UpdatedAt = DateTime.UtcNow;
        item.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        await _context.Entry(item).Reference(ii => ii.Category).LoadAsync();

        var response = new InventoryItemResponseDto(
            item.Id,
            item.HouseholdId,
            item.CategoryId,
            item.Category?.Name,
            item.Name,
            item.Description,
            item.PurchaseDate,
            item.PurchasePrice,
            item.CurrentValue,
            item.Location,
            item.SerialNumber,
            item.ModelNumber,
            item.Manufacturer,
            item.PhotoUrls,
            item.Notes,
            item.CreatedAt,
            item.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete an inventory item (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteInventoryItem(Guid id)
    {
        var item = await _context.InventoryItems
            .Where(ii => ii.Id == id && ii.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
        {
            return NotFound(new { Message = "Inventory item not found" });
        }

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
        {
            return Forbid();
        }

        item.DeletedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        item.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get inventory summary for a household
    /// </summary>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(InventorySummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetInventorySummary(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var items = await _context.InventoryItems
            .Include(ii => ii.Category)
            .Where(ii => ii.HouseholdId == householdId && ii.DeletedAt == null)
            .ToListAsync();

        var totalItems = items.Count;
        var totalPurchaseValue = items.Sum(i => i.PurchasePrice);
        var totalCurrentValue = items.Where(i => i.CurrentValue.HasValue).Sum(i => i.CurrentValue!.Value);
        var estimatedDepreciation = totalPurchaseValue - totalCurrentValue;

        var categoryBreakdown = items
            .GroupBy(i => new { i.CategoryId, CategoryName = i.Category?.Name ?? "Uncategorized" })
            .Select(g => new CategoryInventoryStatsDto(
                g.Key.CategoryId,
                g.Key.CategoryName,
                g.Count(),
                g.Sum(i => i.CurrentValue ?? i.PurchasePrice)
            ))
            .OrderByDescending(c => c.TotalValue)
            .ToList();

        var locationBreakdown = items
            .GroupBy(i => i.Location)
            .Select(g => new LocationInventoryStatsDto(
                g.Key,
                g.Count(),
                g.Sum(i => i.CurrentValue ?? i.PurchasePrice)
            ))
            .OrderByDescending(l => l.ItemCount)
            .ToList();

        var summary = new InventorySummaryDto(
            totalItems,
            totalPurchaseValue,
            totalCurrentValue,
            estimatedDepreciation,
            categoryBreakdown,
            locationBreakdown
        );

        return Ok(summary);
    }

    // ==================== WARRANTIES ====================

    /// <summary>
    /// Get all warranties for an inventory item
    /// </summary>
    [HttpGet("{itemId}/warranties")]
    [ProducesResponseType(typeof(List<WarrantyResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetWarranties(Guid itemId)
    {
        var item = await _context.InventoryItems
            .Where(i => i.Id == itemId && i.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound(new { message = "Inventory item not found" });

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
            return Forbid();

        var warranties = await _context.Warranties
            .Where(w => w.InventoryItemId == itemId)
            .Select(w => new WarrantyResponseDto
            {
                Id = w.Id,
                InventoryItemId = w.InventoryItemId,
                Provider = w.Provider,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                CoverageDetails = w.CoverageDetails,
                DocumentUrl = w.DocumentUrl,
                IsActive = w.IsActive ?? true,
                CreatedAt = w.CreatedAt,
                UpdatedAt = w.UpdatedAt
            })
            .ToListAsync();

        return Ok(warranties);
    }

    /// <summary>
    /// Add a warranty to an inventory item
    /// </summary>
    [HttpPost("{itemId}/warranties")]
    [ProducesResponseType(typeof(WarrantyResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddWarranty(Guid itemId, [FromBody] CreateWarrantyDto dto)
    {
        var item = await _context.InventoryItems
            .Where(i => i.Id == itemId && i.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound(new { message = "Inventory item not found" });

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var warranty = new Warranties
        {
            Id = Guid.NewGuid(),
            InventoryItemId = itemId,
            Provider = dto.Provider,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CoverageDetails = dto.CoverageDetails,
            DocumentUrl = dto.DocumentUrl,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = userId,
            UpdatedAt = now,
            UpdatedBy = userId
        };

        _context.Warranties.Add(warranty);
        await _context.SaveChangesAsync();

        var response = new WarrantyResponseDto
        {
            Id = warranty.Id,
            InventoryItemId = warranty.InventoryItemId,
            Provider = warranty.Provider,
            StartDate = warranty.StartDate,
            EndDate = warranty.EndDate,
            CoverageDetails = warranty.CoverageDetails,
            DocumentUrl = warranty.DocumentUrl,
            IsActive = warranty.IsActive ?? true,
            CreatedAt = warranty.CreatedAt,
            UpdatedAt = warranty.UpdatedAt
        };

        return CreatedAtAction(nameof(GetWarranties), new { itemId = itemId }, response);
    }

    /// <summary>
    /// Update a warranty
    /// </summary>
    [HttpPut("warranties/{id}")]
    [ProducesResponseType(typeof(WarrantyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWarranty(Guid id, [FromBody] UpdateWarrantyDto dto)
    {
        var warranty = await _context.Warranties
            .Include(w => w.InventoryItem)
            .Where(w => w.Id == id)
            .FirstOrDefaultAsync();

        if (warranty == null)
            return NotFound(new { message = "Warranty not found" });

        if (!await IsUserMemberOfHousehold(warranty.InventoryItem.HouseholdId))
            return Forbid();

        if (dto.Provider != null) warranty.Provider = dto.Provider;
        if (dto.StartDate.HasValue) warranty.StartDate = dto.StartDate.Value;
        if (dto.EndDate.HasValue) warranty.EndDate = dto.EndDate.Value;
        if (dto.CoverageDetails != null) warranty.CoverageDetails = dto.CoverageDetails;
        if (dto.DocumentUrl != null) warranty.DocumentUrl = dto.DocumentUrl;
        if (dto.IsActive.HasValue) warranty.IsActive = dto.IsActive;

        warranty.UpdatedAt = DateTime.UtcNow;
        warranty.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new WarrantyResponseDto
        {
            Id = warranty.Id,
            InventoryItemId = warranty.InventoryItemId,
            Provider = warranty.Provider,
            StartDate = warranty.StartDate,
            EndDate = warranty.EndDate,
            CoverageDetails = warranty.CoverageDetails,
            DocumentUrl = warranty.DocumentUrl,
            IsActive = warranty.IsActive ?? true,
            CreatedAt = warranty.CreatedAt,
            UpdatedAt = warranty.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Delete a warranty
    /// </summary>
    [HttpDelete("warranties/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteWarranty(Guid id)
    {
        var warranty = await _context.Warranties
            .Include(w => w.InventoryItem)
            .Where(w => w.Id == id)
            .FirstOrDefaultAsync();

        if (warranty == null)
            return NotFound(new { message = "Warranty not found" });

        if (!await IsUserMemberOfHousehold(warranty.InventoryItem.HouseholdId))
            return Forbid();

        _context.Warranties.Remove(warranty);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ==================== ITEM MAINTENANCE SCHEDULES ====================

    /// <summary>
    /// Get all maintenance schedules for an inventory item
    /// </summary>
    [HttpGet("{itemId}/maintenance-schedules")]
    [ProducesResponseType(typeof(List<ItemMaintenanceScheduleResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMaintenanceSchedules(Guid itemId)
    {
        var item = await _context.InventoryItems
            .Where(i => i.Id == itemId && i.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound(new { message = "Inventory item not found" });

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
            return Forbid();

        var schedules = await _context.ItemMaintenanceSchedules
            .Include(ims => ims.Frequency)
            .Where(ims => ims.InventoryItemId == itemId)
            .Select(ims => new ItemMaintenanceScheduleResponseDto
            {
                Id = ims.Id,
                InventoryItemId = ims.InventoryItemId,
                Task = ims.Task,
                Description = ims.Description,
                FrequencyId = ims.FrequencyId,
                FrequencyName = ims.Frequency.Name,
                LastCompleted = ims.LastCompleted,
                NextDue = ims.NextDue,
                IsActive = ims.IsActive ?? true,
                CreatedAt = ims.CreatedAt,
                UpdatedAt = ims.UpdatedAt
            })
            .ToListAsync();

        return Ok(schedules);
    }

    /// <summary>
    /// Add a maintenance schedule to an inventory item
    /// </summary>
    [HttpPost("{itemId}/maintenance-schedules")]
    [ProducesResponseType(typeof(ItemMaintenanceScheduleResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddMaintenanceSchedule(Guid itemId, [FromBody] CreateItemMaintenanceScheduleDto dto)
    {
        var item = await _context.InventoryItems
            .Where(i => i.Id == itemId && i.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound(new { message = "Inventory item not found" });

        if (!await IsUserMemberOfHousehold(item.HouseholdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var schedule = new ItemMaintenanceSchedules
        {
            Id = Guid.NewGuid(),
            InventoryItemId = itemId,
            Task = dto.Task,
            Description = dto.Description,
            FrequencyId = dto.FrequencyId,
            LastCompleted = dto.LastCompleted,
            NextDue = dto.NextDue,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = userId,
            UpdatedAt = now,
            UpdatedBy = userId
        };

        _context.ItemMaintenanceSchedules.Add(schedule);
        await _context.SaveChangesAsync();

        var createdSchedule = await _context.ItemMaintenanceSchedules
            .Include(ims => ims.Frequency)
            .FirstAsync(ims => ims.Id == schedule.Id);

        var response = new ItemMaintenanceScheduleResponseDto
        {
            Id = createdSchedule.Id,
            InventoryItemId = createdSchedule.InventoryItemId,
            Task = createdSchedule.Task,
            Description = createdSchedule.Description,
            FrequencyId = createdSchedule.FrequencyId,
            FrequencyName = createdSchedule.Frequency.Name,
            LastCompleted = createdSchedule.LastCompleted,
            NextDue = createdSchedule.NextDue,
            IsActive = createdSchedule.IsActive ?? true,
            CreatedAt = createdSchedule.CreatedAt,
            UpdatedAt = createdSchedule.UpdatedAt
        };

        return CreatedAtAction(nameof(GetMaintenanceSchedules), new { itemId = itemId }, response);
    }

    /// <summary>
    /// Update a maintenance schedule
    /// </summary>
    [HttpPut("maintenance-schedules/{id}")]
    [ProducesResponseType(typeof(ItemMaintenanceScheduleResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMaintenanceSchedule(Guid id, [FromBody] UpdateItemMaintenanceScheduleDto dto)
    {
        var schedule = await _context.ItemMaintenanceSchedules
            .Include(ims => ims.InventoryItem)
            .Include(ims => ims.Frequency)
            .Where(ims => ims.Id == id)
            .FirstOrDefaultAsync();

        if (schedule == null)
            return NotFound(new { message = "Maintenance schedule not found" });

        if (!await IsUserMemberOfHousehold(schedule.InventoryItem.HouseholdId))
            return Forbid();

        if (dto.Task != null) schedule.Task = dto.Task;
        if (dto.Description != null) schedule.Description = dto.Description;
        if (dto.FrequencyId.HasValue) schedule.FrequencyId = dto.FrequencyId.Value;
        if (dto.LastCompleted.HasValue) schedule.LastCompleted = dto.LastCompleted;
        if (dto.NextDue.HasValue) schedule.NextDue = dto.NextDue.Value;
        if (dto.IsActive.HasValue) schedule.IsActive = dto.IsActive;

        schedule.UpdatedAt = DateTime.UtcNow;
        schedule.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new ItemMaintenanceScheduleResponseDto
        {
            Id = schedule.Id,
            InventoryItemId = schedule.InventoryItemId,
            Task = schedule.Task,
            Description = schedule.Description,
            FrequencyId = schedule.FrequencyId,
            FrequencyName = schedule.Frequency.Name,
            LastCompleted = schedule.LastCompleted,
            NextDue = schedule.NextDue,
            IsActive = schedule.IsActive ?? true,
            CreatedAt = schedule.CreatedAt,
            UpdatedAt = schedule.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Delete a maintenance schedule
    /// </summary>
    [HttpDelete("maintenance-schedules/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMaintenanceSchedule(Guid id)
    {
        var schedule = await _context.ItemMaintenanceSchedules
            .Include(ims => ims.InventoryItem)
            .Where(ims => ims.Id == id)
            .FirstOrDefaultAsync();

        if (schedule == null)
            return NotFound(new { message = "Maintenance schedule not found" });

        if (!await IsUserMemberOfHousehold(schedule.InventoryItem.HouseholdId))
            return Forbid();

        _context.ItemMaintenanceSchedules.Remove(schedule);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record WarrantyResponseDto
{
    public Guid Id { get; init; }
    public Guid InventoryItemId { get; init; }
    public string Provider { get; init; } = null!;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public string? CoverageDetails { get; init; }
    public string? DocumentUrl { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateWarrantyDto
{
    public string Provider { get; init; } = null!;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public string? CoverageDetails { get; init; }
    public string? DocumentUrl { get; init; }
}

public record UpdateWarrantyDto
{
    public string? Provider { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public string? CoverageDetails { get; init; }
    public string? DocumentUrl { get; init; }
    public bool? IsActive { get; init; }
}

public record ItemMaintenanceScheduleResponseDto
{
    public Guid Id { get; init; }
    public Guid InventoryItemId { get; init; }
    public string Task { get; init; } = null!;
    public string? Description { get; init; }
    public Guid FrequencyId { get; init; }
    public string FrequencyName { get; init; } = null!;
    public DateOnly? LastCompleted { get; init; }
    public DateOnly NextDue { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateItemMaintenanceScheduleDto
{
    public string Task { get; init; } = null!;
    public string? Description { get; init; }
    public Guid FrequencyId { get; init; }
    public DateOnly? LastCompleted { get; init; }
    public DateOnly NextDue { get; init; }
}

public record UpdateItemMaintenanceScheduleDto
{
    public string? Task { get; init; }
    public string? Description { get; init; }
    public Guid? FrequencyId { get; init; }
    public DateOnly? LastCompleted { get; init; }
    public DateOnly? NextDue { get; init; }
    public bool? IsActive { get; init; }
}

