using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing service providers (contractors, vendors, etc.)
/// Global list - not household-specific, but can be filtered by category
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ServiceProvidersController : ControllerBase
{
    private readonly TheButlerDbContext _context;
    private readonly ILogger<ServiceProvidersController> _logger;

    public ServiceProvidersController(TheButlerDbContext context, ILogger<ServiceProvidersController> logger)
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

    /// <summary>
    /// Get all active service providers
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ServiceProviderResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] Guid? categoryId = null, [FromQuery] bool? isActive = true)
    {
        var query = _context.ServiceProviders.AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(sp => sp.CategoryId == categoryId.Value);

        if (isActive.HasValue)
            query = query.Where(sp => sp.IsActive == isActive.Value);

        var providers = await query
            .OrderBy(sp => sp.Name)
            .Select(sp => new ServiceProviderResponseDto
            {
                Id = sp.Id,
                Name = sp.Name,
                CategoryId = sp.CategoryId,
                Phone = sp.Phone,
                Email = sp.Email,
                Website = sp.Website,
                AddressLine1 = sp.AddressLine1,
                City = sp.City,
                State = sp.State,
                PostalCode = sp.PostalCode,
                Rating = sp.Rating,
                Notes = sp.Notes,
                IsActive = sp.IsActive ?? true,
                CreatedAt = sp.CreatedAt,
                UpdatedAt = sp.UpdatedAt
            })
            .ToListAsync();

        return Ok(providers);
    }

    /// <summary>
    /// Get a specific service provider by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ServiceProviderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var provider = await _context.ServiceProviders
            .Where(sp => sp.Id == id)
            .Select(sp => new ServiceProviderResponseDto
            {
                Id = sp.Id,
                Name = sp.Name,
                CategoryId = sp.CategoryId,
                Phone = sp.Phone,
                Email = sp.Email,
                Website = sp.Website,
                AddressLine1 = sp.AddressLine1,
                City = sp.City,
                State = sp.State,
                PostalCode = sp.PostalCode,
                Rating = sp.Rating,
                Notes = sp.Notes,
                IsActive = sp.IsActive ?? true,
                CreatedAt = sp.CreatedAt,
                UpdatedAt = sp.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (provider == null)
            return NotFound(new { message = "Service provider not found" });

        return Ok(provider);
    }

    /// <summary>
    /// Create a new service provider
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ServiceProviderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateServiceProviderDto dto)
    {
        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var provider = new ServiceProviders
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            Phone = dto.Phone,
            Email = dto.Email,
            Website = dto.Website,
            AddressLine1 = dto.AddressLine1,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            Rating = dto.Rating,
            Notes = dto.Notes,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = userId,
            UpdatedAt = now,
            UpdatedBy = userId
        };

        _context.ServiceProviders.Add(provider);
        await _context.SaveChangesAsync();

        var response = new ServiceProviderResponseDto
        {
            Id = provider.Id,
            Name = provider.Name,
            CategoryId = provider.CategoryId,
            Phone = provider.Phone,
            Email = provider.Email,
            Website = provider.Website,
            AddressLine1 = provider.AddressLine1,
            City = provider.City,
            State = provider.State,
            PostalCode = provider.PostalCode,
            Rating = provider.Rating,
            Notes = provider.Notes,
            IsActive = provider.IsActive ?? true,
            CreatedAt = provider.CreatedAt,
            UpdatedAt = provider.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = provider.Id }, response);
    }

    /// <summary>
    /// Update an existing service provider
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ServiceProviderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServiceProviderDto dto)
    {
        var provider = await _context.ServiceProviders.FindAsync(id);
        if (provider == null)
            return NotFound(new { message = "Service provider not found" });

        var userId = GetCurrentUserId();

        if (dto.Name != null) provider.Name = dto.Name;
        if (dto.CategoryId.HasValue) provider.CategoryId = dto.CategoryId;
        if (dto.Phone != null) provider.Phone = dto.Phone;
        if (dto.Email != null) provider.Email = dto.Email;
        if (dto.Website != null) provider.Website = dto.Website;
        if (dto.AddressLine1 != null) provider.AddressLine1 = dto.AddressLine1;
        if (dto.City != null) provider.City = dto.City;
        if (dto.State != null) provider.State = dto.State;
        if (dto.PostalCode != null) provider.PostalCode = dto.PostalCode;
        if (dto.Rating.HasValue) provider.Rating = dto.Rating;
        if (dto.Notes != null) provider.Notes = dto.Notes;
        if (dto.IsActive.HasValue) provider.IsActive = dto.IsActive;

        provider.UpdatedAt = DateTime.UtcNow;
        provider.UpdatedBy = userId;

        await _context.SaveChangesAsync();

        var response = new ServiceProviderResponseDto
        {
            Id = provider.Id,
            Name = provider.Name,
            CategoryId = provider.CategoryId,
            Phone = provider.Phone,
            Email = provider.Email,
            Website = provider.Website,
            AddressLine1 = provider.AddressLine1,
            City = provider.City,
            State = provider.State,
            PostalCode = provider.PostalCode,
            Rating = provider.Rating,
            Notes = provider.Notes,
            IsActive = provider.IsActive ?? true,
            CreatedAt = provider.CreatedAt,
            UpdatedAt = provider.UpdatedAt
        };

        return Ok(response);
    }

    /// <summary>
    /// Delete a service provider (mark as inactive)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var provider = await _context.ServiceProviders.FindAsync(id);
        if (provider == null)
            return NotFound(new { message = "Service provider not found" });

        provider.IsActive = false;
        provider.UpdatedAt = DateTime.UtcNow;
        provider.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record ServiceProviderResponseDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = null!;
    public Guid? CategoryId { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
    public string? AddressLine1 { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public decimal? Rating { get; init; }
    public string? Notes { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record CreateServiceProviderDto
{
    public string Name { get; init; } = null!;
    public Guid? CategoryId { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
    public string? AddressLine1 { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public decimal? Rating { get; init; }
    public string? Notes { get; init; }
}

public record UpdateServiceProviderDto
{
    public string? Name { get; init; }
    public Guid? CategoryId { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Website { get; init; }
    public string? AddressLine1 { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? PostalCode { get; init; }
    public decimal? Rating { get; init; }
    public string? Notes { get; init; }
    public bool? IsActive { get; init; }
}

