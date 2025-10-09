using System;
using System.Collections.Generic;

namespace TheButler.Core.Domain.Model;

/// <summary>
/// Many-to-many tags for documents.
/// </summary>
public partial class DocumentTags
{
    public Guid DocumentId { get; set; }

    public string Tag { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Documents Document { get; set; } = null!;
}

