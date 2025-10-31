using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for user registration and initial setup
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SetupController : ControllerBase
{
    private readonly TheButlerDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public SetupController(
        TheButlerDbContext context, 
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
    }

    /// <summary>
    /// Register a new user and create their first household
    /// </summary>
    /// <param name="dto">Registration details</param>
    /// <returns>User info, JWT token, and household details</returns>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status202Accepted)] // For email confirmation required
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { Message = "Email is required" });

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { Message = "Password is required" });

        if (dto.Password.Length < 6)
            return BadRequest(new { Message = "Password must be at least 6 characters" });

        if (string.IsNullOrWhiteSpace(dto.HouseholdName))
            return BadRequest(new { Message = "Household name is required" });

        var supabaseUrl = _configuration["Supabase:Url"];
        var supabaseAnonKey = _configuration["Supabase:AnonKey"];

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseAnonKey))
        {
            return StatusCode(500, new { Message = "Supabase configuration is missing" });
        }

        try
        {
            // Step 1: Sign up user with Supabase Auth
            var signUpRequest = new
            {
                email = dto.Email,
                password = dto.Password,
                data = new
                {
                    first_name = dto.FirstName,
                    last_name = dto.LastName
                }
            };

            var signUpJson = JsonSerializer.Serialize(signUpRequest);
            var signUpContent = new StringContent(signUpJson, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("apikey", supabaseAnonKey);

            var signUpResponse = await _httpClient.PostAsync(
                $"{supabaseUrl}/auth/v1/signup",
                signUpContent
            );

            var signUpResponseContent = await signUpResponse.Content.ReadAsStringAsync();

            if (!signUpResponse.IsSuccessStatusCode)
            {
                try
                {
                    var errorDoc = JsonDocument.Parse(signUpResponseContent);
                    var errorMessage = errorDoc.RootElement.TryGetProperty("msg", out var msgProp) 
                        ? msgProp.GetString() 
                        : errorDoc.RootElement.TryGetProperty("message", out var messageProp)
                            ? messageProp.GetString()
                            : "Sign up failed";
                    return BadRequest(new { Message = errorMessage, Details = signUpResponseContent });
                }
                catch
                {
                    return BadRequest(new { Message = "Sign up failed", Details = signUpResponseContent });
                }
            }

            // Parse the response and check what we got
            var signUpData = JsonDocument.Parse(signUpResponseContent);
            
            // Supabase can return the user in two ways:
            // 1. Direct user object at root (when email confirmation is required)
            // 2. Nested under "user" property (when auto-confirmed)
            JsonElement userElement;
            if (signUpData.RootElement.TryGetProperty("user", out var nestedUser))
            {
                userElement = nestedUser;
            }
            else if (signUpData.RootElement.TryGetProperty("id", out _))
            {
                // User object is at root level
                userElement = signUpData.RootElement;
            }
            else
            {
                return StatusCode(500, new 
                { 
                    Message = "Unexpected response from Supabase - no user data",
                    Response = signUpResponseContent 
                });
            }

            // Get user ID
            if (!userElement.TryGetProperty("id", out var idElement))
            {
                return StatusCode(500, new 
                { 
                    Message = "Unexpected response from Supabase - no user ID",
                    Response = signUpResponseContent 
                });
            }
            var userId = Guid.Parse(idElement.GetString()!);

            // Check if email confirmation is required
            bool emailConfirmationRequired = userElement.TryGetProperty("confirmation_sent_at", out _);

            // Check if we have an access token (won't be present if email confirmation is required)
            string? accessToken = null;
            string? tokenType = null;
            long expiresIn = 0;
            string? refreshToken = null;

            if (signUpData.RootElement.TryGetProperty("access_token", out var tokenElement))
            {
                accessToken = tokenElement.GetString();
                tokenType = signUpData.RootElement.TryGetProperty("token_type", out var tt) ? tt.GetString() : null;
                expiresIn = signUpData.RootElement.TryGetProperty("expires_in", out var ei) ? ei.GetInt64() : 0;
                refreshToken = signUpData.RootElement.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null;
            }
            else if (signUpData.RootElement.TryGetProperty("session", out var sessionElement))
            {
                if (sessionElement.TryGetProperty("access_token", out var sessionTokenElement))
                {
                    accessToken = sessionTokenElement.GetString();
                    tokenType = sessionElement.TryGetProperty("token_type", out var tt) ? tt.GetString() : null;
                    expiresIn = sessionElement.TryGetProperty("expires_in", out var ei) ? ei.GetInt64() : 0;
                    refreshToken = sessionElement.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null;
                }
            }

            // Step 2: Create default household (whether or not email confirmation is required)
            var now = DateTime.UtcNow;
            var household = new Households
            {
                Id = Guid.NewGuid(),
                Name = dto.HouseholdName,
                CreatedAt = now,
                UpdatedAt = now,
                CreatedBy = userId,
                IsActive = true
            };

            _context.Households.Add(household);

            // Step 3: Add user as household admin
            var householdMember = new HouseholdMembers
            {
                Id = Guid.NewGuid(),
                HouseholdId = household.Id,
                UserId = userId,
                Role = "Admin",
                JoinedAt = now,
                IsActive = true
            };

            _context.HouseholdMembers.Add(householdMember);
            await _context.SaveChangesAsync();

            // Step 4: Return appropriate response based on email confirmation status
            if (string.IsNullOrEmpty(accessToken) && emailConfirmationRequired)
            {
                return StatusCode(202, new
                {
                    Message = "Registration successful! Please check your email to confirm your account.",
                    UserId = userId,
                    Email = dto.Email,
                    HouseholdId = household.Id,
                    HouseholdName = household.Name,
                    Note = "After confirming your email, use /api/setup/login to get your access token"
                });
            }
            
            // If no access token but no confirmation required, something went wrong
            if (string.IsNullOrEmpty(accessToken))
            {
                return StatusCode(500, new
                {
                    Message = "Unexpected: No access token and no confirmation required",
                    Response = signUpResponseContent
                });
            }

            // If we have an access token, return success with full registration details
            return Ok(new RegisterResponseDto(
                userId,
                dto.Email,
                accessToken,
                tokenType ?? "bearer",
                expiresIn,
                refreshToken ?? "",
                household.Id,
                household.Name
            ));
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, new { Message = "Failed to communicate with Supabase", Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Registration failed", Error = ex.Message });
        }
    }

    /// <summary>
    /// Login an existing user
    /// </summary>
    /// <param name="dto">Login credentials</param>
    /// <returns>User info, JWT token, and household memberships</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {

        

        // Validate input
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest(new { Message = "Email is required" });

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { Message = "Password is required" });

        var supabaseUrl = _configuration["Supabase:Url"];
        var supabaseAnonKey = _configuration["Supabase:AnonKey"];
        Console.WriteLine($"[DEBUG] Supabase AnonKey (first 10 chars): {supabaseAnonKey?.Substring(0, Math.Min(10, supabaseAnonKey.Length))}");
        Console.WriteLine($"[DEBUG] Full key length: {supabaseAnonKey?.Length}");

        if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseAnonKey))
        {
            return StatusCode(500, new { Message = "Supabase configuration is missing" });
        }

        try
        {
            // Sign in with Supabase Auth
            var loginRequest = new
            {
                email = dto.Email,
                password = dto.Password
            };

            var loginJson = JsonSerializer.Serialize(loginRequest);
            var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("apikey", supabaseAnonKey);

            var loginResponse = await _httpClient.PostAsync(
                $"{supabaseUrl}/auth/v1/token?grant_type=password",
                loginContent
            );

            var loginResponseContent = await loginResponse.Content.ReadAsStringAsync();

            if (!loginResponse.IsSuccessStatusCode)
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            var loginData = JsonDocument.Parse(loginResponseContent);
            
            if (!loginData.RootElement.TryGetProperty("access_token", out var accessTokenElement) ||
                !loginData.RootElement.TryGetProperty("user", out var userElement) ||
                !userElement.TryGetProperty("id", out var idElement))
            {
                return StatusCode(500, new 
                { 
                    Message = "Unexpected response from Supabase during login",
                    Response = loginResponseContent 
                });
            }

            var accessToken = accessTokenElement.GetString()!;
            var userId = Guid.Parse(idElement.GetString()!);
            var tokenType = loginData.RootElement.TryGetProperty("token_type", out var tt) ? tt.GetString() : null;
            var expiresIn = loginData.RootElement.TryGetProperty("expires_in", out var ei) ? ei.GetInt64() : 0;
            var refreshToken = loginData.RootElement.TryGetProperty("refresh_token", out var rt) ? rt.GetString() : null;

            // Get user's households
            var households = await _context.HouseholdMembers
                .Where(hm => hm.UserId == userId && hm.IsActive == true)
                .Include(hm => hm.Household)
                .Select(hm => new HouseholdMembershipDto(
                    hm.HouseholdId,
                    hm.Household.Name,
                    hm.Role ?? "Member",
                    hm.JoinedAt
                ))
                .ToListAsync();

            var response = new LoginResponseDto(
                userId,
                dto.Email,
                accessToken,
                tokenType ?? "bearer",
                expiresIn,
                refreshToken ?? "",
                households
            );

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = "Login failed", Error = ex.Message });
        }
    }

    /// <summary>
    /// Get user info by ID (for testing)
    /// </summary>
    [HttpGet("user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserInfo(Guid userId)
    {
        var households = await _context.HouseholdMembers
            .Where(hm => hm.UserId == userId && hm.IsActive == true)
            .Include(hm => hm.Household)
            .Select(hm => new
            {
                HouseholdId = hm.HouseholdId,
                HouseholdName = hm.Household.Name,
                Role = hm.Role,
                JoinedAt = hm.JoinedAt
            })
            .ToListAsync();

        if (!households.Any())
        {
            return NotFound(new { Message = "User not found or has no households" });
        }

        return Ok(new
        {
            UserId = userId,
            Households = households
        });
    }

    /// <summary>
    /// Test endpoint to verify Supabase configuration
    /// </summary>
    [HttpGet("test-config")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult TestConfig()
    {
        var supabaseUrl = _configuration["Supabase:Url"];
        var hasAnonKey = !string.IsNullOrEmpty(_configuration["Supabase:AnonKey"]);
        var hasJwtSecret = !string.IsNullOrEmpty(_configuration["Supabase:JwtSecret"]);

        return Ok(new
        {
            SupabaseConfigured = !string.IsNullOrEmpty(supabaseUrl) && hasAnonKey && hasJwtSecret,
            SupabaseUrl = supabaseUrl ?? "Not configured",
            HasAnonKey = hasAnonKey,
            HasJwtSecret = hasJwtSecret
        });
    }
}

