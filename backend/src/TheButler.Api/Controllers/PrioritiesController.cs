using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing priorities (read-only lookup table)
/// Examples: Low, Medium, High, Critical
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PrioritiesController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public PrioritiesController(TheButlerDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all priorities
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PriorityResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var priorities = await _context.Priorities
            .OrderBy(p => p.SortOrder)
            .Select(p => new PriorityResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                SortOrder = p.SortOrder,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(priorities);
    }

    /// <summary>
    /// Get a specific priority by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PriorityResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var priority = await _context.Priorities
            .Where(p => p.Id == id)
            .Select(p => new PriorityResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                SortOrder = p.SortOrder,
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (priority == null)
        {
            return NotFound(new { Message = "Priority not found" });
        }

        return Ok(priority);
    }

    /// <summary>
    /// Get priority by name (e.g., "High", "Low")
    /// </summary>
    [HttpGet("name/{name}")]
    [ProducesResponseType(typeof(PriorityResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByName(string name)
    {
        var priority = await _context.Priorities
            .Where(p => p.Name.ToLower() == name.ToLower())
            .Select(p => new PriorityResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                SortOrder = p.SortOrder,
                CreatedAt = p.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (priority == null)
        {
            return NotFound(new { Message = $"Priority '{name}' not found" });
        }

        return Ok(priority);
    }
}

public record PriorityResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = null!;
    public int SortOrder { get; init; }
    public DateTime CreatedAt { get; init; }
}

