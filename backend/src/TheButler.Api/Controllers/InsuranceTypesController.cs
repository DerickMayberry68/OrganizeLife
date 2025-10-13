using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing insurance types (read-only lookup table)
/// Examples: Home, Auto, Health, Life, etc.
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InsuranceTypesController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public InsuranceTypesController(TheButlerDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all insurance types
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InsuranceTypeResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var types = await _context.InsuranceTypes
            .OrderBy(t => t.Name)
            .Select(t => new InsuranceTypeResponseDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(types);
    }

    /// <summary>
    /// Get a specific insurance type by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InsuranceTypeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var type = await _context.InsuranceTypes
            .Where(t => t.Id == id)
            .Select(t => new InsuranceTypeResponseDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                CreatedAt = t.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (type == null)
        {
            return NotFound(new { Message = "Insurance type not found" });
        }

        return Ok(type);
    }

    /// <summary>
    /// Get insurance type by name (e.g., "Home", "Auto")
    /// </summary>
    [HttpGet("name/{name}")]
    [ProducesResponseType(typeof(InsuranceTypeResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByName(string name)
    {
        var type = await _context.InsuranceTypes
            .Where(t => t.Name.ToLower() == name.ToLower())
            .Select(t => new InsuranceTypeResponseDto
            {
                Id = t.Id,
                Name = t.Name,
                Description = t.Description,
                CreatedAt = t.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (type == null)
        {
            return NotFound(new { Message = $"Insurance type '{name}' not found" });
        }

        return Ok(type);
    }
}

public record InsuranceTypeResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = null!;
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
}

