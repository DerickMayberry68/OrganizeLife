using System.ComponentModel.DataAnnotations;

namespace TheButler.Api.DTOs;

public record RegisterRequestDto(
    [Required] [EmailAddress] string Email,
    [Required] [MinLength(6)] string Password, // Supabase default min length is 6
    [Required] [StringLength(100)] string FirstName,
    [Required] [StringLength(100)] string LastName,
    [Required] [StringLength(200)] string HouseholdName
);

public record LoginRequestDto(
    [Required] [EmailAddress] string Email,
    [Required] string Password
);

public record HouseholdMembershipDto(
    Guid HouseholdId,
    string HouseholdName,
    string Role,
    DateTime JoinedAt
);

public record LoginResponseDto(
    Guid UserId,
    string Email,
    string AccessToken,
    string TokenType,
    long ExpiresIn,
    string RefreshToken,
    List<HouseholdMembershipDto> Households
);

public record RegisterResponseDto(
    Guid UserId,
    string Email,
    string AccessToken,
    string TokenType,
    long ExpiresIn,
    string RefreshToken,
    Guid DefaultHouseholdId,
    string DefaultHouseholdName
);
