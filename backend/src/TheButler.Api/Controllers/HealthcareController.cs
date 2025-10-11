using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing healthcare providers, allergies, vaccinations, medical records, and health metrics
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HealthcareController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public HealthcareController(TheButlerDbContext context)
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

    #region Healthcare Providers

    /// <summary>
    /// Get all healthcare providers for a household
    /// </summary>
    [HttpGet("household/{householdId}/providers")]
    [ProducesResponseType(typeof(List<HealthcareProviderResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdProviders(Guid householdId, [FromQuery] bool? isActive = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.HealthcareProviders
            .Where(p => p.HouseholdId == householdId && p.DeletedAt == null);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        var providers = await query
            .OrderBy(p => p.Name)
            .Select(p => new HealthcareProviderResponseDto(
                p.Id,
                p.HouseholdId,
                p.Name,
                p.ProviderType,
                p.Specialty,
                p.PhoneNumber,
                p.Email,
                p.Website,
                p.AddressLine1,
                p.AddressLine2,
                p.City,
                p.State,
                p.PostalCode,
                p.Country,
                p.Notes,
                p.IsActive ?? true,
                p.CreatedAt,
                p.UpdatedAt
            ))
            .ToListAsync();

        return Ok(providers);
    }

    /// <summary>
    /// Get a specific healthcare provider by ID
    /// </summary>
    [HttpGet("providers/{id}")]
    [ProducesResponseType(typeof(HealthcareProviderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProvider(Guid id)
    {
        var provider = await _context.HealthcareProviders
            .Where(p => p.Id == id && p.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (provider == null)
        {
            return NotFound(new { Message = "Provider not found" });
        }

        if (!await IsUserMemberOfHousehold(provider.HouseholdId))
        {
            return Forbid();
        }

        var response = new HealthcareProviderResponseDto(
            provider.Id,
            provider.HouseholdId,
            provider.Name,
            provider.ProviderType,
            provider.Specialty,
            provider.PhoneNumber,
            provider.Email,
            provider.Website,
            provider.AddressLine1,
            provider.AddressLine2,
            provider.City,
            provider.State,
            provider.PostalCode,
            provider.Country,
            provider.Notes,
            provider.IsActive ?? true,
            provider.CreatedAt,
            provider.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new healthcare provider
    /// </summary>
    [HttpPost("providers")]
    [ProducesResponseType(typeof(HealthcareProviderResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateProvider([FromBody] CreateHealthcareProviderDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Provider name is required" });
        }

        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var provider = new HealthcareProviders
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            Name = dto.Name,
            ProviderType = dto.ProviderType,
            Specialty = dto.Specialty,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Website = dto.Website,
            AddressLine1 = dto.AddressLine1,
            AddressLine2 = dto.AddressLine2,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            Country = dto.Country,
            Notes = dto.Notes,
            IsActive = dto.IsActive,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.HealthcareProviders.Add(provider);
        await _context.SaveChangesAsync();

        var response = new HealthcareProviderResponseDto(
            provider.Id,
            provider.HouseholdId,
            provider.Name,
            provider.ProviderType,
            provider.Specialty,
            provider.PhoneNumber,
            provider.Email,
            provider.Website,
            provider.AddressLine1,
            provider.AddressLine2,
            provider.City,
            provider.State,
            provider.PostalCode,
            provider.Country,
            provider.Notes,
            provider.IsActive ?? true,
            provider.CreatedAt,
            provider.UpdatedAt
        );

        return CreatedAtAction(nameof(GetProvider), new { id = provider.Id }, response);
    }

    /// <summary>
    /// Update an existing healthcare provider
    /// </summary>
    [HttpPut("providers/{id}")]
    [ProducesResponseType(typeof(HealthcareProviderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProvider(Guid id, [FromBody] UpdateHealthcareProviderDto dto)
    {
        var provider = await _context.HealthcareProviders
            .Where(p => p.Id == id && p.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (provider == null)
        {
            return NotFound(new { Message = "Provider not found" });
        }

        if (!await IsUserMemberOfHousehold(provider.HouseholdId))
        {
            return Forbid();
        }

        if (dto.Name != null) provider.Name = dto.Name;
        if (dto.ProviderType != null) provider.ProviderType = dto.ProviderType;
        if (dto.Specialty != null) provider.Specialty = dto.Specialty;
        if (dto.PhoneNumber != null) provider.PhoneNumber = dto.PhoneNumber;
        if (dto.Email != null) provider.Email = dto.Email;
        if (dto.Website != null) provider.Website = dto.Website;
        if (dto.AddressLine1 != null) provider.AddressLine1 = dto.AddressLine1;
        if (dto.AddressLine2 != null) provider.AddressLine2 = dto.AddressLine2;
        if (dto.City != null) provider.City = dto.City;
        if (dto.State != null) provider.State = dto.State;
        if (dto.PostalCode != null) provider.PostalCode = dto.PostalCode;
        if (dto.Country != null) provider.Country = dto.Country;
        if (dto.Notes != null) provider.Notes = dto.Notes;
        if (dto.IsActive.HasValue) provider.IsActive = dto.IsActive.Value;

        provider.UpdatedAt = DateTime.UtcNow;
        provider.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        var response = new HealthcareProviderResponseDto(
            provider.Id,
            provider.HouseholdId,
            provider.Name,
            provider.ProviderType,
            provider.Specialty,
            provider.PhoneNumber,
            provider.Email,
            provider.Website,
            provider.AddressLine1,
            provider.AddressLine2,
            provider.City,
            provider.State,
            provider.PostalCode,
            provider.Country,
            provider.Notes,
            provider.IsActive ?? true,
            provider.CreatedAt,
            provider.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a healthcare provider (soft delete)
    /// </summary>
    [HttpDelete("providers/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProvider(Guid id)
    {
        var provider = await _context.HealthcareProviders
            .Where(p => p.Id == id && p.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (provider == null)
        {
            return NotFound(new { Message = "Provider not found" });
        }

        if (!await IsUserMemberOfHousehold(provider.HouseholdId))
        {
            return Forbid();
        }

        provider.DeletedAt = DateTime.UtcNow;
        provider.UpdatedAt = DateTime.UtcNow;
        provider.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    #endregion

    #region Allergies

    /// <summary>
    /// Get all allergies for a household member
    /// </summary>
    [HttpGet("household/{householdId}/members/{memberId}/allergies")]
    [ProducesResponseType(typeof(List<AllergyResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMemberAllergies(Guid householdId, Guid memberId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var allergies = await _context.Allergies
            .Where(a => a.HouseholdId == householdId 
                     && a.HouseholdMemberId == memberId 
                     && a.DeletedAt == null)
            .OrderBy(a => a.Severity)
            .ThenBy(a => a.AllergyType)
            .Select(a => new AllergyResponseDto(
                a.Id,
                a.HouseholdId,
                a.HouseholdMemberId,
                null,
                a.AllergyType,
                a.Allergen,
                a.Severity,
                a.Reaction,
                a.DiagnosedDate,
                a.Treatment,
                a.IsActive ?? true,
                a.Notes,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync();

        return Ok(allergies);
    }

    /// <summary>
    /// Create a new allergy record
    /// </summary>
    [HttpPost("allergies")]
    [ProducesResponseType(typeof(AllergyResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAllergy([FromBody] CreateAllergyDto dto)
    {
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var allergy = new Allergies
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            HouseholdMemberId = dto.HouseholdMemberId,
            AllergyType = dto.AllergyType,
            Allergen = dto.Allergen,
            Severity = dto.Severity,
            Reaction = dto.Reaction,
            DiagnosedDate = dto.DiagnosedDate,
            Treatment = dto.Treatment,
            IsActive = dto.IsActive,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Allergies.Add(allergy);
        await _context.SaveChangesAsync();

        var response = new AllergyResponseDto(
            allergy.Id,
            allergy.HouseholdId,
            allergy.HouseholdMemberId,
            null,
            allergy.AllergyType,
            allergy.Allergen,
            allergy.Severity,
            allergy.Reaction,
            allergy.DiagnosedDate,
            allergy.Treatment,
            allergy.IsActive ?? true,
            allergy.Notes,
            allergy.CreatedAt,
            allergy.UpdatedAt
        );

        return CreatedAtAction(nameof(GetMemberAllergies), 
            new { householdId = allergy.HouseholdId, memberId = allergy.HouseholdMemberId }, 
            response);
    }

    /// <summary>
    /// Delete an allergy record (soft delete)
    /// </summary>
    [HttpDelete("allergies/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAllergy(Guid id)
    {
        var allergy = await _context.Allergies
            .Where(a => a.Id == id && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (allergy == null)
        {
            return NotFound(new { Message = "Allergy not found" });
        }

        if (!await IsUserMemberOfHousehold(allergy.HouseholdId))
        {
            return Forbid();
        }

        allergy.DeletedAt = DateTime.UtcNow;
        allergy.UpdatedAt = DateTime.UtcNow;
        allergy.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    #endregion

    #region Vaccinations

    /// <summary>
    /// Get all vaccinations for a household member
    /// </summary>
    [HttpGet("household/{householdId}/members/{memberId}/vaccinations")]
    [ProducesResponseType(typeof(List<VaccinationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMemberVaccinations(Guid householdId, Guid memberId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var vaccinations = await _context.Vaccinations
            .Include(v => v.Provider)
            .Where(v => v.HouseholdId == householdId 
                     && v.HouseholdMemberId == memberId 
                     && v.DeletedAt == null)
            .OrderByDescending(v => v.DateAdministered)
            .Select(v => new VaccinationResponseDto(
                v.Id,
                v.HouseholdId,
                v.HouseholdMemberId,
                null,
                v.ProviderId,
                v.Provider != null ? v.Provider.Name : null,
                v.VaccineName,
                v.DateAdministered,
                v.DoseNumber,
                v.LotNumber,
                v.Site,
                v.Route,
                v.NextDoseDate,
                v.IsUpToDate ?? true,
                v.AdministeredBy,
                v.Location,
                v.Reactions,
                v.DocumentUrl,
                v.Notes,
                v.CreatedAt,
                v.UpdatedAt
            ))
            .ToListAsync();

        return Ok(vaccinations);
    }

    /// <summary>
    /// Create a new vaccination record
    /// </summary>
    [HttpPost("vaccinations")]
    [ProducesResponseType(typeof(VaccinationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateVaccination([FromBody] CreateVaccinationDto dto)
    {
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var vaccination = new Vaccinations
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            HouseholdMemberId = dto.HouseholdMemberId,
            ProviderId = dto.ProviderId,
            VaccineName = dto.VaccineName,
            DateAdministered = dto.DateAdministered,
            DoseNumber = dto.DoseNumber,
            LotNumber = dto.LotNumber,
            Site = dto.Site,
            Route = dto.Route,
            NextDoseDate = dto.NextDoseDate,
            IsUpToDate = dto.IsUpToDate,
            AdministeredBy = dto.AdministeredBy,
            Location = dto.Location,
            Reactions = dto.Reactions,
            DocumentUrl = dto.DocumentUrl,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Vaccinations.Add(vaccination);
        await _context.SaveChangesAsync();

        var createdVaccination = await _context.Vaccinations
            .Include(v => v.Provider)
            .FirstAsync(v => v.Id == vaccination.Id);

        var response = new VaccinationResponseDto(
            createdVaccination.Id,
            createdVaccination.HouseholdId,
            createdVaccination.HouseholdMemberId,
            null,
            createdVaccination.ProviderId,
            createdVaccination.Provider?.Name,
            createdVaccination.VaccineName,
            createdVaccination.DateAdministered,
            createdVaccination.DoseNumber,
            createdVaccination.LotNumber,
            createdVaccination.Site,
            createdVaccination.Route,
            createdVaccination.NextDoseDate,
            createdVaccination.IsUpToDate ?? true,
            createdVaccination.AdministeredBy,
            createdVaccination.Location,
            createdVaccination.Reactions,
            createdVaccination.DocumentUrl,
            createdVaccination.Notes,
            createdVaccination.CreatedAt,
            createdVaccination.UpdatedAt
        );

        return CreatedAtAction(nameof(GetMemberVaccinations), 
            new { householdId = vaccination.HouseholdId, memberId = vaccination.HouseholdMemberId }, 
            response);
    }

    /// <summary>
    /// Delete a vaccination record (soft delete)
    /// </summary>
    [HttpDelete("vaccinations/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVaccination(Guid id)
    {
        var vaccination = await _context.Vaccinations
            .Where(v => v.Id == id && v.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (vaccination == null)
        {
            return NotFound(new { Message = "Vaccination not found" });
        }

        if (!await IsUserMemberOfHousehold(vaccination.HouseholdId))
        {
            return Forbid();
        }

        vaccination.DeletedAt = DateTime.UtcNow;
        vaccination.UpdatedAt = DateTime.UtcNow;
        vaccination.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    #endregion

    #region Healthcare Summary

    /// <summary>
    /// Get healthcare summary for a household
    /// </summary>
    [HttpGet("household/{householdId}/summary")]
    [ProducesResponseType(typeof(HealthcareSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHealthcareSummary(Guid householdId)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var totalProviders = await _context.HealthcareProviders
            .CountAsync(p => p.HouseholdId == householdId && p.DeletedAt == null);

        var totalActiveProviders = await _context.HealthcareProviders
            .CountAsync(p => p.HouseholdId == householdId && p.DeletedAt == null && p.IsActive == true);

        var totalMedicalRecords = await _context.MedicalRecords
            .CountAsync(mr => mr.HouseholdId == householdId && mr.DeletedAt == null);

        var totalActiveMedications = await _context.Medications
            .CountAsync(m => m.HouseholdId == householdId && m.DeletedAt == null && m.IsActive == true);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var next30Days = today.AddDays(30);

        var upcomingAppointments = await _context.Appointments
            .CountAsync(a => a.HouseholdId == householdId 
                          && a.DeletedAt == null
                          && a.Status == "scheduled"
                          && a.AppointmentDate >= today
                          && a.AppointmentDate <= next30Days);

        var totalVaccinations = await _context.Vaccinations
            .CountAsync(v => v.HouseholdId == householdId && v.DeletedAt == null);

        var totalActiveAllergies = await _context.Allergies
            .CountAsync(a => a.HouseholdId == householdId && a.DeletedAt == null && a.IsActive == true);

        var nextAppointments = await _context.Appointments
            .Where(a => a.HouseholdId == householdId 
                     && a.DeletedAt == null
                     && a.Status == "scheduled"
                     && a.AppointmentDate >= today)
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Take(5)
            .Select(a => new UpcomingAppointmentDto(
                a.Id,
                null,
                a.AppointmentDate,
                a.AppointmentTime,
                a.AppointmentType,
                a.ProviderName,
                a.AppointmentDate.DayNumber - today.DayNumber,
                a.Status ?? "scheduled"
            ))
            .ToListAsync();

        var summary = new HealthcareSummaryDto(
            totalProviders,
            totalActiveProviders,
            totalMedicalRecords,
            totalActiveMedications,
            upcomingAppointments,
            totalVaccinations,
            totalActiveAllergies,
            nextAppointments
        );

        return Ok(summary);
    }

    #endregion
}

