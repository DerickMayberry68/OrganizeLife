using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Document vault for important files. Stores file paths, not binary data.
/// </summary>
public partial class Documents
{
    public Guid Id { get; set; }

    public Guid HouseholdId { get; set; }

    public Guid? CategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string FileName { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public string FileType { get; set; } = null!;

    public long FileSizeBytes { get; set; }

    public DateOnly UploadDate { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public bool? IsImportant { get; set; }

    public bool? IsArchived { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid CreatedBy { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid UpdatedBy { get; set; }

    public DateTime? DeletedAt { get; set; }

    public virtual Categories? Category { get; set; }

    public virtual ICollection<DocumentTags> DocumentTags { get; set; } = new List<DocumentTags>();

    public virtual Households Household { get; set; } = null!;
}

