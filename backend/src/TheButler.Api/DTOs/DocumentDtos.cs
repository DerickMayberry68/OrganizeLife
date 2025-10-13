namespace TheButler.Api.DTOs;

#region Document DTOs

/// <summary>
/// Request DTO for creating a document
/// </summary>
public record CreateDocumentDto(
    Guid HouseholdId,
    string Title,
    string? Description,
    string FileName,
    string FilePath,
    string FileType,
    long FileSizeBytes,
    DateOnly UploadDate,
    Guid? CategoryId = null,
    DateOnly? ExpiryDate = null,
    bool IsImportant = false,
    bool IsArchived = false
);

/// <summary>
/// Request DTO for updating a document
/// </summary>
public record UpdateDocumentDto(
    string? Title = null,
    string? Description = null,
    Guid? CategoryId = null,
    DateOnly? ExpiryDate = null,
    bool? IsImportant = null,
    bool? IsArchived = null
);

/// <summary>
/// Response DTO for document details
/// </summary>
public record DocumentResponseDto(
    Guid Id,
    Guid HouseholdId,
    Guid? CategoryId,
    string? CategoryName,
    string Title,
    string? Description,
    string FileName,
    string FilePath,
    string FileType,
    long FileSizeBytes,
    DateOnly UploadDate,
    DateOnly? ExpiryDate,
    bool IsImportant,
    bool IsArchived,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Document summary for a household
/// </summary>
public record DocumentSummaryDto(
    int TotalDocuments,
    int ImportantDocuments,
    int ArchivedDocuments,
    int ExpiringDocuments,
    long TotalSizeBytes,
    List<ExpiringDocumentDto> ExpiringDocs
);

/// <summary>
/// Expiring document info
/// </summary>
public record ExpiringDocumentDto(
    Guid Id,
    string Title,
    DateOnly ExpiryDate,
    int DaysUntilExpiry,
    bool IsImportant
);

#endregion

