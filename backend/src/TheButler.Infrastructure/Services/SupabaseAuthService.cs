using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TheButler.Core.Domain.Model;

namespace TheButler.Infrastructure.Services;

public interface ISupabaseAuthService
{
    Task<ApplicationUser?> GetUserFromToken(string token);
    ClaimsPrincipal? ValidateToken(string token);
}

public class SupabaseAuthService : ISupabaseAuthService
{
    private readonly IConfiguration _configuration;
    private readonly string _jwtSecret;
    private readonly string _supabaseUrl;

    public SupabaseAuthService(IConfiguration configuration)
    {
        _configuration = configuration;
        _jwtSecret = configuration["Supabase:JwtSecret"] 
            ?? throw new InvalidOperationException("Supabase:JwtSecret not configured");
        _supabaseUrl = configuration["Supabase:Url"] 
            ?? throw new InvalidOperationException("Supabase:Url not configured");
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        // Try UTF-8 encoding first (most common for Supabase)
        byte[] key;
        try
        {
            key = Encoding.UTF8.GetBytes(_jwtSecret);
        }
        catch
        {
            // Fallback to base64 if UTF-8 fails
            key = Convert.FromBase64String(_jwtSecret);
        }

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = $"{_supabaseUrl}/auth/v1", // Supabase includes /auth/v1 in the issuer
                ValidateAudience = true,
                ValidAudience = "authenticated",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public Task<ApplicationUser?> GetUserFromToken(string token)
    {
        var principal = ValidateToken(token);
        if (principal == null)
            return Task.FromResult<ApplicationUser?>(null);

        var userId = principal.FindFirst("sub")?.Value;
        var email = principal.FindFirst("email")?.Value;
        var phone = principal.FindFirst("phone")?.Value;
        var role = principal.FindFirst("role")?.Value;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
            return Task.FromResult<ApplicationUser?>(null);

        // Parse user metadata from claims
        var userMetadataClaim = principal.FindFirst("user_metadata")?.Value;
        Dictionary<string, object>? userMetadata = null;
        if (!string.IsNullOrEmpty(userMetadataClaim))
        {
            userMetadata = JsonSerializer.Deserialize<Dictionary<string, object>>(userMetadataClaim);
        }

        var appMetadataClaim = principal.FindFirst("app_metadata")?.Value;
        Dictionary<string, object>? appMetadata = null;
        if (!string.IsNullOrEmpty(appMetadataClaim))
        {
            appMetadata = JsonSerializer.Deserialize<Dictionary<string, object>>(appMetadataClaim);
        }

        var user = new ApplicationUser
        {
            Id = Guid.Parse(userId),
            Email = email,
            Phone = phone,
            Role = role,
            UserMetadata = userMetadata,
            AppMetadata = appMetadata,
            FullName = userMetadata?.GetValueOrDefault("full_name")?.ToString(),
            AvatarUrl = userMetadata?.GetValueOrDefault("avatar_url")?.ToString()
        };
        
        return Task.FromResult<ApplicationUser?>(user);
    }
}

