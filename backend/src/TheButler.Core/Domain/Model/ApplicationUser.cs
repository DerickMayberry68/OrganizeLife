namespace TheButler.Core.Domain.Model;

/// <summary>
/// Represents a user from Supabase Auth
/// This is populated from the JWT token claims, not stored in our database
/// </summary>
public class ApplicationUser
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public Dictionary<string, object>? UserMetadata { get; set; }
    public Dictionary<string, object>? AppMetadata { get; set; }
    public string? Role { get; set; }
    public DateTime? EmailConfirmedAt { get; set; }
    public DateTime? PhoneConfirmedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastSignInAt { get; set; }
}

