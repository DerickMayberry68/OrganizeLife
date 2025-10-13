using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing household documents
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public DocumentsController(TheButlerDbContext context)
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
    /// Get all documents for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<DocumentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdDocuments(
        Guid householdId,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] bool? isImportant = null,
        [FromQuery] bool? isArchived = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Documents
            .Include(d => d.Category)
            .Where(d => d.HouseholdId == householdId && d.DeletedAt == null);

        if (categoryId.HasValue)
            query = query.Where(d => d.CategoryId == categoryId.Value);

        if (isImportant.HasValue)
            query = query.Where(d => d.IsImportant == isImportant.Value);

        if (isArchived.HasValue)
            query = query.Where(d => d.IsArchived == isArchived.Value);

        var documents = await query
            .OrderByDescending(d => d.UploadDate)
            .Select(d => new DocumentResponseDto(
                d.Id,
                d.HouseholdId,
                d.CategoryId,
                d.Category != null ? d.Category.Name : null,
                d.Title,
                d.Description,
                d.FileName,
                d.FilePath,
                d.FileType,
                d.FileSizeBytes,
                d.UploadDate,
                d.ExpiryDate,
                d.IsImportant ?? false,
                d.IsArchived ?? false,
                d.CreatedAt,
                d.UpdatedAt
            ))
            .ToListAsync();

        return Ok(documents);
    }

    /// <summary>
    /// Get a specific document by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(DocumentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocument(Guid id)
    {
        var document = await _context.Documents
            .Include(d => d.Category)
            .Where(d => d.Id == id && d.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            return NotFound(new { Message = "Document not found" });
        }

        if (!await IsUserMemberOfHousehold(document.HouseholdId))
        {
            return Forbid();
        }

        var response = new DocumentResponseDto(
            document.Id,
            document.HouseholdId,
            document.CategoryId,
            document.Category?.Name,
            document.Title,
            document.Description,
            document.FileName,
            document.FilePath,
            document.FileType,
            document.FileSizeBytes,
            document.UploadDate,
            document.ExpiryDate,
            document.IsImportant ?? false,
            document.IsArchived ?? false,
            document.CreatedAt,
            document.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new document
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DocumentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateDocument([FromBody] CreateDocumentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
        {
            return BadRequest(new { Message = "Title is required" });
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

        var document = new Documents
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            CategoryId = dto.CategoryId,
            Title = dto.Title,
            Description = dto.Description,
            FileName = dto.FileName,
            FilePath = dto.FilePath,
            FileType = dto.FileType,
            FileSizeBytes = dto.FileSizeBytes,
            UploadDate = dto.UploadDate,
            ExpiryDate = dto.ExpiryDate,
            IsImportant = dto.IsImportant,
            IsArchived = dto.IsArchived,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        var createdDocument = await _context.Documents
            .Include(d => d.Category)
            .FirstAsync(d => d.Id == document.Id);

        var response = new DocumentResponseDto(
            createdDocument.Id,
            createdDocument.HouseholdId,
            createdDocument.CategoryId,
            createdDocument.Category?.Name,
            createdDocument.Title,
            createdDocument.Description,
            createdDocument.FileName,
            createdDocument.FilePath,
            createdDocument.FileType,
            createdDocument.FileSizeBytes,
            createdDocument.UploadDate,
            createdDocument.ExpiryDate,
            createdDocument.IsImportant ?? false,
            createdDocument.IsArchived ?? false,
            createdDocument.CreatedAt,
            createdDocument.UpdatedAt
        );

        return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, response);
    }

    /// <summary>
    /// Update an existing document
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(DocumentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateDocument(Guid id, [FromBody] UpdateDocumentDto dto)
    {
        var document = await _context.Documents
            .Include(d => d.Category)
            .Where(d => d.Id == id && d.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            return NotFound(new { Message = "Document not found" });
        }

        if (!await IsUserMemberOfHousehold(document.HouseholdId))
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
            document.CategoryId = dto.CategoryId.Value;
        }

        if (dto.Title != null) document.Title = dto.Title;
        if (dto.Description != null) document.Description = dto.Description;
        if (dto.ExpiryDate.HasValue) document.ExpiryDate = dto.ExpiryDate;
        if (dto.IsImportant.HasValue) document.IsImportant = dto.IsImportant;
        if (dto.IsArchived.HasValue) document.IsArchived = dto.IsArchived;

        document.UpdatedAt = DateTime.UtcNow;
        document.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        await _context.Entry(document).Reference(d => d.Category).LoadAsync();

        var response = new DocumentResponseDto(
            document.Id,
            document.HouseholdId,
            document.CategoryId,
            document.Category?.Name,
            document.Title,
            document.Description,
            document.FileName,
            document.FilePath,
            document.FileType,
            document.FileSizeBytes,
            document.UploadDate,
            document.ExpiryDate,
            document.IsImportant ?? false,
            document.IsArchived ?? false,
            document.CreatedAt,
            document.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a document (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var document = await _context.Documents
            .Where(d => d.Id == id && d.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (document == null)
        {
            return NotFound(new { Message = "Document not found" });
        }

        if (!await IsUserMemberOfHousehold(document.HouseholdId))
        {
            return Forbid();
        }

        document.DeletedAt = DateTime.UtcNow;
        document.UpdatedAt = DateTime.UtcNow;
        document.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get document summary for a household
    /// </summary>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(DocumentSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetDocumentSummary(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var documents = await _context.Documents
            .Where(d => d.HouseholdId == householdId && d.DeletedAt == null)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next30Days = today.AddDays(30);

        var totalDocuments = documents.Count;
        var importantDocuments = documents.Count(d => d.IsImportant == true);
        var archivedDocuments = documents.Count(d => d.IsArchived == true);
        var expiringDocuments = documents.Count(d => d.ExpiryDate.HasValue && d.ExpiryDate >= today && d.ExpiryDate <= next30Days);
        var totalSizeBytes = documents.Sum(d => d.FileSizeBytes);

        var expiringDocs = documents
            .Where(d => d.ExpiryDate.HasValue && d.ExpiryDate >= today && d.ExpiryDate <= next30Days)
            .OrderBy(d => d.ExpiryDate)
            .Select(d => new ExpiringDocumentDto(
                d.Id,
                d.Title,
                d.ExpiryDate!.Value,
                d.ExpiryDate.Value.DayNumber - today.DayNumber,
                d.IsImportant ?? false
            ))
            .ToList();

        var summary = new DocumentSummaryDto(
            totalDocuments,
            importantDocuments,
            archivedDocuments,
            expiringDocuments,
            totalSizeBytes,
            expiringDocs
        );

        return Ok(summary);
    }

    // ==================== DOCUMENT TAGS MANAGEMENT ====================

    /// <summary>
    /// Get all tags for a document
    /// </summary>
    [HttpGet("{documentId}/tags")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDocumentTags(Guid documentId)
    {
        var document = await _context.Documents
            .Where(d => d.Id == documentId && d.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (document == null)
            return NotFound(new { message = "Document not found" });

        if (!await IsUserMemberOfHousehold(document.HouseholdId))
            return Forbid();

        var tags = await _context.DocumentTags
            .Where(dt => dt.DocumentId == documentId)
            .Select(dt => dt.Tag)
            .OrderBy(t => t)
            .ToListAsync();

        return Ok(tags);
    }

    /// <summary>
    /// Add a tag to a document
    /// </summary>
    [HttpPost("{documentId}/tags")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddDocumentTag(Guid documentId, [FromBody] AddTagDto dto)
    {
        var document = await _context.Documents
            .Where(d => d.Id == documentId && d.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (document == null)
            return NotFound(new { message = "Document not found" });

        if (!await IsUserMemberOfHousehold(document.HouseholdId))
            return Forbid();

        // Check if tag already exists
        var existingTag = await _context.DocumentTags
            .FirstOrDefaultAsync(dt => dt.DocumentId == documentId && dt.Tag == dto.Tag);

        if (existingTag == null)
        {
            var documentTag = new DocumentTags
            {
                DocumentId = documentId,
                Tag = dto.Tag,
                CreatedAt = DateTime.UtcNow
            };

            _context.DocumentTags.Add(documentTag);
            await _context.SaveChangesAsync();
        }

        // Return all tags
        var tags = await _context.DocumentTags
            .Where(dt => dt.DocumentId == documentId)
            .Select(dt => dt.Tag)
            .OrderBy(t => t)
            .ToListAsync();

        return Ok(tags);
    }

    /// <summary>
    /// Remove a tag from a document
    /// </summary>
    [HttpDelete("{documentId}/tags/{tag}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveDocumentTag(Guid documentId, string tag)
    {
        var document = await _context.Documents
            .Where(d => d.Id == documentId && d.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (document == null)
            return NotFound(new { message = "Document not found" });

        if (!await IsUserMemberOfHousehold(document.HouseholdId))
            return Forbid();

        var documentTag = await _context.DocumentTags
            .FirstOrDefaultAsync(dt => dt.DocumentId == documentId && dt.Tag == tag);

        if (documentTag != null)
        {
            _context.DocumentTags.Remove(documentTag);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    /// <summary>
    /// Get all unique tags used in a household
    /// </summary>
    [HttpGet("household/{householdId}/all-tags")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllHouseholdTags(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
            return Forbid();

        var tags = await _context.DocumentTags
            .Where(dt => _context.Documents
                .Any(d => d.Id == dt.DocumentId && d.HouseholdId == householdId && d.DeletedAt == null))
            .Select(dt => dt.Tag)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync();

        return Ok(tags);
    }
}

public record AddTagDto
{
    public string Tag { get; init; } = null!;
}

