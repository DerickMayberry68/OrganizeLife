using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing frequencies/billing cycles (read-only lookup table)
/// Examples: Monthly, Weekly, Annually, etc.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FrequenciesController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public FrequenciesController(TheButlerDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all frequencies
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<FrequencyResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var frequencies = await _context.Frequencies
            .OrderBy(f => f.IntervalDays)
            .Select(f => new FrequencyResponseDto
            {
                Id = f.Id,
                Name = f.Name,
                IntervalDays = f.IntervalDays,
                CreatedAt = f.CreatedAt
            })
            .ToListAsync();

        return Ok(frequencies);
    }

    /// <summary>
    /// Get a specific frequency by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FrequencyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var frequency = await _context.Frequencies
            .Where(f => f.Id == id)
            .Select(f => new FrequencyResponseDto
            {
                Id = f.Id,
                Name = f.Name,
                IntervalDays = f.IntervalDays,
                CreatedAt = f.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (frequency == null)
        {
            return NotFound(new { Message = "Frequency not found" });
        }

        return Ok(frequency);
    }

    /// <summary>
    /// Get frequency by name (e.g., "Monthly", "Weekly")
    /// </summary>
    [HttpGet("name/{name}")]
    [ProducesResponseType(typeof(FrequencyResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByName(string name)
    {
        var frequency = await _context.Frequencies
            .Where(f => f.Name.ToLower() == name.ToLower())
            .Select(f => new FrequencyResponseDto
            {
                Id = f.Id,
                Name = f.Name,
                IntervalDays = f.IntervalDays,
                CreatedAt = f.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (frequency == null)
        {
            return NotFound(new { Message = $"Frequency '{name}' not found" });
        }

        return Ok(frequency);
    }
}

public record FrequencyResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = null!;
    public int IntervalDays { get; init; }
    public DateTime CreatedAt { get; init; }
}

