using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing household-specific settings and preferences
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HouseholdSettingsController : ControllerBase
{
    private readonly TheButlerDbContext _context;
    private readonly ILogger<HouseholdSettingsController> _logger;

    public HouseholdSettingsController(TheButlerDbContext context, ILogger<HouseholdSettingsController> logger)
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
    /// Get all settings for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<HouseholdSettingResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdSettings(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
            return Forbid();

        var settings = await _context.HouseholdSettings
            .Where(hs => hs.HouseholdId == householdId)
            .OrderBy(hs => hs.SettingKey)
            .Select(hs => new HouseholdSettingResponseDto
            {
                Id = hs.Id,
                HouseholdId = hs.HouseholdId,
                SettingKey = hs.SettingKey,
                SettingValue = hs.SettingValue,
                DataType = hs.DataType,
                CreatedAt = hs.CreatedAt,
                UpdatedAt = hs.UpdatedAt
            })
            .ToListAsync();

        return Ok(settings);
    }

    /// <summary>
    /// Get a specific setting by key
    /// </summary>
    [HttpGet("household/{householdId}/key/{key}")]
    [ProducesResponseType(typeof(HouseholdSettingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSetting(Guid householdId, string key)
    {
        if (!await IsUserMemberOfHousehold(householdId))
            return Forbid();

        var setting = await _context.HouseholdSettings
            .Where(hs => hs.HouseholdId == householdId && hs.SettingKey == key)
            .Select(hs => new HouseholdSettingResponseDto
            {
                Id = hs.Id,
                HouseholdId = hs.HouseholdId,
                SettingKey = hs.SettingKey,
                SettingValue = hs.SettingValue,
                DataType = hs.DataType,
                CreatedAt = hs.CreatedAt,
                UpdatedAt = hs.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (setting == null)
            return NotFound(new { message = $"Setting '{key}' not found" });

        return Ok(setting);
    }

    /// <summary>
    /// Create or update a setting (upsert)
    /// </summary>
    [HttpPost("household/{householdId}")]
    [ProducesResponseType(typeof(HouseholdSettingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpsertSetting(Guid householdId, [FromBody] UpsertSettingDto dto)
    {
        if (!await IsUserMemberOfHousehold(householdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var existing = await _context.HouseholdSettings
            .FirstOrDefaultAsync(hs => hs.HouseholdId == householdId && hs.SettingKey == dto.SettingKey);

        if (existing != null)
        {
            // Update existing
            existing.SettingValue = dto.SettingValue;
            existing.DataType = dto.DataType ?? existing.DataType;
            existing.UpdatedAt = now;
            existing.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            var response = new HouseholdSettingResponseDto
            {
                Id = existing.Id,
                HouseholdId = existing.HouseholdId,
                SettingKey = existing.SettingKey,
                SettingValue = existing.SettingValue,
                DataType = existing.DataType,
                CreatedAt = existing.CreatedAt,
                UpdatedAt = existing.UpdatedAt
            };

            return Ok(response);
        }
        else
        {
            // Create new
            var setting = new HouseholdSettings
            {
                Id = Guid.NewGuid(),
                HouseholdId = householdId,
                SettingKey = dto.SettingKey,
                SettingValue = dto.SettingValue,
                DataType = dto.DataType ?? "string",
                CreatedAt = now,
                CreatedBy = userId,
                UpdatedAt = now,
                UpdatedBy = userId
            };

            _context.HouseholdSettings.Add(setting);
            await _context.SaveChangesAsync();

            var response = new HouseholdSettingResponseDto
            {
                Id = setting.Id,
                HouseholdId = setting.HouseholdId,
                SettingKey = setting.SettingKey,
                SettingValue = setting.SettingValue,
                DataType = setting.DataType,
                CreatedAt = setting.CreatedAt,
                UpdatedAt = setting.UpdatedAt
            };

            return Ok(response);
        }
    }

    /// <summary>
    /// Bulk update settings
    /// </summary>
    [HttpPut("household/{householdId}/bulk")]
    [ProducesResponseType(typeof(List<HouseholdSettingResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkUpdate(Guid householdId, [FromBody] List<UpsertSettingDto> settings)
    {
        if (!await IsUserMemberOfHousehold(householdId))
            return Forbid();

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;
        var responses = new List<HouseholdSettingResponseDto>();

        foreach (var dto in settings)
        {
            var existing = await _context.HouseholdSettings
                .FirstOrDefaultAsync(hs => hs.HouseholdId == householdId && hs.SettingKey == dto.SettingKey);

            if (existing != null)
            {
                existing.SettingValue = dto.SettingValue;
                existing.DataType = dto.DataType ?? existing.DataType;
                existing.UpdatedAt = now;
                existing.UpdatedBy = userId;

                responses.Add(new HouseholdSettingResponseDto
                {
                    Id = existing.Id,
                    HouseholdId = existing.HouseholdId,
                    SettingKey = existing.SettingKey,
                    SettingValue = existing.SettingValue,
                    DataType = existing.DataType,
                    CreatedAt = existing.CreatedAt,
                    UpdatedAt = existing.UpdatedAt
                });
            }
            else
            {
                var setting = new HouseholdSettings
                {
                    Id = Guid.NewGuid(),
                    HouseholdId = householdId,
                    SettingKey = dto.SettingKey,
                    SettingValue = dto.SettingValue,
                    DataType = dto.DataType ?? "string",
                    CreatedAt = now,
                    CreatedBy = userId,
                    UpdatedAt = now,
                    UpdatedBy = userId
                };

                _context.HouseholdSettings.Add(setting);

                responses.Add(new HouseholdSettingResponseDto
                {
                    Id = setting.Id,
                    HouseholdId = setting.HouseholdId,
                    SettingKey = setting.SettingKey,
                    SettingValue = setting.SettingValue,
                    DataType = setting.DataType,
                    CreatedAt = setting.CreatedAt,
                    UpdatedAt = setting.UpdatedAt
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok(responses);
    }

    /// <summary>
    /// Delete a setting
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var setting = await _context.HouseholdSettings.FindAsync(id);
        if (setting == null)
            return NotFound(new { message = "Setting not found" });

        if (!await IsUserMemberOfHousehold(setting.HouseholdId))
            return Forbid();

        _context.HouseholdSettings.Remove(setting);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record HouseholdSettingResponseDto
{
    public Guid Id { get; init; }
    public Guid HouseholdId { get; init; }
    public string SettingKey { get; init; } = null!;
    public string? SettingValue { get; init; }
    public string DataType { get; init; } = null!;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record UpsertSettingDto
{
    public string SettingKey { get; init; } = null!;
    public string? SettingValue { get; init; }
    public string? DataType { get; init; }
}

