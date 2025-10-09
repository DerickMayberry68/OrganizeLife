using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TheButler.Infrastructure.Services;

namespace TheButler.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthTestController : ControllerBase
{
    private readonly ISupabaseAuthService? _authService;

    public AuthTestController(IServiceProvider serviceProvider)
    {
        // Try to get the auth service - it might not be registered if Supabase is not configured
        _authService = serviceProvider.GetService<ISupabaseAuthService>();
    }

    /// <summary>
    /// Test endpoint - no authentication required
    /// </summary>
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok(new 
        { 
            Message = "This is a public endpoint - no authentication required",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Protected endpoint - requires valid Supabase JWT token
    /// </summary>
    [Authorize]
    [HttpGet("protected")]
    public IActionResult Protected()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value 
                    ?? User.FindFirst("email")?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value 
                   ?? User.FindFirst("role")?.Value;

        return Ok(new
        {
            Message = "You are authenticated!",
            UserId = userId,
            Email = email,
            Role = role,
            Claims = User.Claims.Select(c => new { c.Type, c.Value })
        });
    }

    /// <summary>
    /// Get current user details from token
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        if (_authService == null)
        {
            return StatusCode(503, new
            {
                Message = "Supabase authentication not configured",
                Note = "Update Supabase:JwtSecret and Supabase:Url in appsettings.json"
            });
        }

        // Extract token from Authorization header
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized(new { Message = "Missing or invalid Authorization header" });
        }

        var token = authHeader.Substring("Bearer ".Length).Trim();
        var user = await _authService.GetUserFromToken(token);

        if (user == null)
        {
            return Unauthorized(new { Message = "Invalid token" });
        }

        return Ok(user);
    }
}

