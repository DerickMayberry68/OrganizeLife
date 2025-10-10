using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing categories (system-wide, shared across all households)
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public CategoriesController(TheButlerDbContext context)
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
    /// Get all active categories
    /// </summary>
    /// <returns>List of categories</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<CategoryResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive == true)
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryResponseDto(
                c.Id,
                c.Name,
                c.Type,
                c.Description,
                c.IsActive ?? true,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// Get all categories by type
    /// </summary>
    /// <param name="type">The category type (Income, Expense, Transfer)</param>
    /// <returns>List of categories of specified type</returns>
    [HttpGet("type/{type}")]
    [ProducesResponseType(typeof(List<CategoryResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategoriesByType(string type)
    {
        var categories = await _context.Categories
            .Where(c => c.Type == type && c.IsActive == true)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponseDto(
                c.Id,
                c.Name,
                c.Type,
                c.Description,
                c.IsActive ?? true,
                c.CreatedAt,
                c.UpdatedAt
            ))
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// Get a specific category by ID
    /// </summary>
    /// <param name="id">The category ID</param>
    /// <returns>Category details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CategoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategory(Guid id)
    {
        var category = await _context.Categories
            .Where(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (category == null)
        {
            return NotFound(new { Message = "Category not found" });
        }

        var response = new CategoryResponseDto(
            category.Id,
            category.Name,
            category.Type,
            category.Description,
            category.IsActive ?? true,
            category.CreatedAt,
            category.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new category
    /// </summary>
    /// <param name="dto">Category creation details</param>
    /// <returns>Created category</returns>
    [HttpPost]
    [ProducesResponseType(typeof(CategoryResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Category name is required" });
        }

        if (string.IsNullOrWhiteSpace(dto.Type))
        {
            return BadRequest(new { Message = "Category type is required" });
        }

        var now = DateTime.UtcNow;

        // Create the category
        var category = new Categories
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Type = dto.Type,
            Description = dto.Description,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var response = new CategoryResponseDto(
            category.Id,
            category.Name,
            category.Type,
            category.Description,
            category.IsActive ?? true,
            category.CreatedAt,
            category.UpdatedAt
        );

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, response);
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    /// <param name="id">The category ID</param>
    /// <param name="dto">Updated category details</param>
    /// <returns>Updated category</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(CategoryResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _context.Categories
            .Where(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (category == null)
        {
            return NotFound(new { Message = "Category not found" });
        }

        // Update fields (only if provided in DTO)
        if (dto.Name != null)
            category.Name = dto.Name;
        
        if (dto.Type != null)
            category.Type = dto.Type;
        
        if (dto.Description != null)
            category.Description = dto.Description;
        
        if (dto.IsActive.HasValue)
            category.IsActive = dto.IsActive.Value;

        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var response = new CategoryResponseDto(
            category.Id,
            category.Name,
            category.Type,
            category.Description,
            category.IsActive ?? true,
            category.CreatedAt,
            category.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a category (soft delete by marking inactive)
    /// Note: Categories are not hard-deleted as they may be referenced by transactions, budgets, etc.
    /// </summary>
    /// <param name="id">The category ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories
            .Where(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (category == null)
        {
            return NotFound(new { Message = "Category not found" });
        }

        // Check if category is in use
        var isInUse = await _context.Transactions.AnyAsync(t => t.CategoryId == id && t.DeletedAt == null) ||
                      await _context.Bills.AnyAsync(b => b.CategoryId == id && b.DeletedAt == null) ||
                      await _context.Budgets.AnyAsync(b => b.CategoryId == id && b.DeletedAt == null) ||
                      await _context.Subscriptions.AnyAsync(s => s.CategoryId == id && s.DeletedAt == null);

        if (isInUse)
        {
            return BadRequest(new { Message = "Cannot delete category that is in use. Mark as inactive instead." });
        }

        // Soft delete by marking inactive
        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get category usage statistics
    /// </summary>
    /// <param name="id">The category ID</param>
    /// <returns>Usage statistics for the category</returns>
    [HttpGet("{id}/usage")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategoryUsage(Guid id)
    {
        var category = await _context.Categories
            .Where(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (category == null)
        {
            return NotFound(new { Message = "Category not found" });
        }

        var transactionCount = await _context.Transactions
            .CountAsync(t => t.CategoryId == id && t.DeletedAt == null);

        var billCount = await _context.Bills
            .CountAsync(b => b.CategoryId == id && b.DeletedAt == null);

        var budgetCount = await _context.Budgets
            .CountAsync(b => b.CategoryId == id && b.DeletedAt == null);

        var subscriptionCount = await _context.Subscriptions
            .CountAsync(s => s.CategoryId == id && s.DeletedAt == null);

        var usage = new
        {
            CategoryId = id,
            CategoryName = category.Name,
            TransactionCount = transactionCount,
            BillCount = billCount,
            BudgetCount = budgetCount,
            SubscriptionCount = subscriptionCount,
            TotalUsage = transactionCount + billCount + budgetCount + subscriptionCount
        };

        return Ok(usage);
    }
}

