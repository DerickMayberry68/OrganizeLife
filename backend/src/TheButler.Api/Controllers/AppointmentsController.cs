using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing medical appointments
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public AppointmentsController(TheButlerDbContext context)
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
    /// Get all appointments for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<AppointmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdAppointments(
        Guid householdId,
        [FromQuery] Guid? householdMemberId = null,
        [FromQuery] string? status = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Appointments
            .Include(a => a.Provider)
            .Where(a => a.HouseholdId == householdId && a.DeletedAt == null);

        if (householdMemberId.HasValue)
            query = query.Where(a => a.HouseholdMemberId == householdMemberId.Value);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(a => a.Status == status);

        var appointments = await query
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(a => new AppointmentResponseDto(
                a.Id,
                a.HouseholdId,
                a.HouseholdMemberId,
                null, // Will need to join if needed
                a.ProviderId,
                a.Provider != null ? a.Provider.Name : a.ProviderName,
                a.AppointmentDate,
                a.AppointmentTime,
                a.AppointmentType,
                a.Reason,
                a.Status ?? "scheduled",
                a.Location,
                a.ReminderDays,
                a.ReminderEnabled ?? true,
                a.PrepInstructions,
                a.FollowUpNotes,
                a.Notes,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Get upcoming appointments for a household
    /// </summary>
    [HttpGet("household/{householdId}/upcoming")]
    [ProducesResponseType(typeof(List<UpcomingAppointmentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUpcomingAppointments(Guid householdId, [FromQuery] int days = 30)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var endDate = today.AddDays(days);

        var appointments = await _context.Appointments
            .Include(a => a.Provider)
            .Where(a => a.HouseholdId == householdId 
                     && a.DeletedAt == null
                     && a.Status == "scheduled"
                     && a.AppointmentDate >= today
                     && a.AppointmentDate <= endDate)
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .Select(a => new UpcomingAppointmentDto(
                a.Id,
                null, // Will need household member name if needed
                a.AppointmentDate,
                a.AppointmentTime,
                a.AppointmentType,
                a.Provider != null ? a.Provider.Name : a.ProviderName,
                a.AppointmentDate.DayNumber - today.DayNumber,
                a.Status ?? "scheduled"
            ))
            .ToListAsync();

        return Ok(appointments);
    }

    /// <summary>
    /// Get a specific appointment by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAppointment(Guid id)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Provider)
            .Where(a => a.Id == id && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return NotFound(new { Message = "Appointment not found" });
        }

        if (!await IsUserMemberOfHousehold(appointment.HouseholdId))
        {
            return Forbid();
        }

        var response = new AppointmentResponseDto(
            appointment.Id,
            appointment.HouseholdId,
            appointment.HouseholdMemberId,
            null,
            appointment.ProviderId,
            appointment.Provider?.Name ?? appointment.ProviderName,
            appointment.AppointmentDate,
            appointment.AppointmentTime,
            appointment.AppointmentType,
            appointment.Reason,
            appointment.Status ?? "scheduled",
            appointment.Location,
            appointment.ReminderDays,
            appointment.ReminderEnabled ?? true,
            appointment.PrepInstructions,
            appointment.FollowUpNotes,
            appointment.Notes,
            appointment.CreatedAt,
            appointment.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new appointment
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        if (!await IsUserMemberOfHousehold(dto.HouseholdId))
        {
            return Forbid();
        }

        // Verify household member exists
        var memberExists = await _context.HouseholdMembers
            .AnyAsync(hm => hm.Id == dto.HouseholdMemberId && hm.HouseholdId == dto.HouseholdId);
        if (!memberExists)
        {
            return BadRequest(new { Message = "Invalid household member ID" });
        }

        // Verify provider if specified
        if (dto.ProviderId.HasValue)
        {
            var providerExists = await _context.HealthcareProviders
                .AnyAsync(p => p.Id == dto.ProviderId.Value && p.HouseholdId == dto.HouseholdId);
            if (!providerExists)
            {
                return BadRequest(new { Message = "Invalid provider ID" });
            }
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var appointment = new Appointments
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            HouseholdMemberId = dto.HouseholdMemberId,
            ProviderId = dto.ProviderId,
            AppointmentDate = dto.AppointmentDate,
            AppointmentTime = dto.AppointmentTime,
            AppointmentType = dto.AppointmentType,
            Reason = dto.Reason,
            Status = dto.Status,
            Location = dto.Location,
            ProviderName = dto.ProviderName,
            ReminderDays = dto.ReminderDays,
            ReminderEnabled = dto.ReminderEnabled,
            PrepInstructions = dto.PrepInstructions,
            FollowUpNotes = dto.FollowUpNotes,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        var createdAppointment = await _context.Appointments
            .Include(a => a.Provider)
            .FirstAsync(a => a.Id == appointment.Id);

        var response = new AppointmentResponseDto(
            createdAppointment.Id,
            createdAppointment.HouseholdId,
            createdAppointment.HouseholdMemberId,
            null,
            createdAppointment.ProviderId,
            createdAppointment.Provider?.Name ?? createdAppointment.ProviderName,
            createdAppointment.AppointmentDate,
            createdAppointment.AppointmentTime,
            createdAppointment.AppointmentType,
            createdAppointment.Reason,
            createdAppointment.Status ?? "scheduled",
            createdAppointment.Location,
            createdAppointment.ReminderDays,
            createdAppointment.ReminderEnabled ?? true,
            createdAppointment.PrepInstructions,
            createdAppointment.FollowUpNotes,
            createdAppointment.Notes,
            createdAppointment.CreatedAt,
            createdAppointment.UpdatedAt
        );

        return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, response);
    }

    /// <summary>
    /// Update an existing appointment
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(AppointmentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAppointment(Guid id, [FromBody] UpdateAppointmentDto dto)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Provider)
            .Where(a => a.Id == id && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return NotFound(new { Message = "Appointment not found" });
        }

        if (!await IsUserMemberOfHousehold(appointment.HouseholdId))
        {
            return Forbid();
        }

        // Update fields
        if (dto.ProviderId.HasValue)
        {
            var providerExists = await _context.HealthcareProviders
                .AnyAsync(p => p.Id == dto.ProviderId.Value && p.HouseholdId == appointment.HouseholdId);
            if (!providerExists)
            {
                return BadRequest(new { Message = "Invalid provider ID" });
            }
            appointment.ProviderId = dto.ProviderId.Value;
        }

        if (dto.AppointmentDate.HasValue) appointment.AppointmentDate = dto.AppointmentDate.Value;
        if (dto.AppointmentTime.HasValue) appointment.AppointmentTime = dto.AppointmentTime;
        if (dto.AppointmentType != null) appointment.AppointmentType = dto.AppointmentType;
        if (dto.Reason != null) appointment.Reason = dto.Reason;
        if (dto.Status != null) appointment.Status = dto.Status;
        if (dto.Location != null) appointment.Location = dto.Location;
        if (dto.ProviderName != null) appointment.ProviderName = dto.ProviderName;
        if (dto.ReminderDays.HasValue) appointment.ReminderDays = dto.ReminderDays;
        if (dto.ReminderEnabled.HasValue) appointment.ReminderEnabled = dto.ReminderEnabled;
        if (dto.PrepInstructions != null) appointment.PrepInstructions = dto.PrepInstructions;
        if (dto.FollowUpNotes != null) appointment.FollowUpNotes = dto.FollowUpNotes;
        if (dto.Notes != null) appointment.Notes = dto.Notes;

        appointment.UpdatedAt = DateTime.UtcNow;
        appointment.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        await _context.Entry(appointment).Reference(a => a.Provider).LoadAsync();

        var response = new AppointmentResponseDto(
            appointment.Id,
            appointment.HouseholdId,
            appointment.HouseholdMemberId,
            null,
            appointment.ProviderId,
            appointment.Provider?.Name ?? appointment.ProviderName,
            appointment.AppointmentDate,
            appointment.AppointmentTime,
            appointment.AppointmentType,
            appointment.Reason,
            appointment.Status ?? "scheduled",
            appointment.Location,
            appointment.ReminderDays,
            appointment.ReminderEnabled ?? true,
            appointment.PrepInstructions,
            appointment.FollowUpNotes,
            appointment.Notes,
            appointment.CreatedAt,
            appointment.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Cancel an appointment
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelAppointment(Guid id, [FromBody] string? cancellationReason = null)
    {
        var appointment = await _context.Appointments
            .Where(a => a.Id == id && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return NotFound(new { Message = "Appointment not found" });
        }

        if (!await IsUserMemberOfHousehold(appointment.HouseholdId))
        {
            return Forbid();
        }

        appointment.Status = "cancelled";
        if (!string.IsNullOrWhiteSpace(cancellationReason))
        {
            appointment.Notes = $"{appointment.Notes}\n\nCancellation Reason: {cancellationReason}".Trim();
        }
        appointment.UpdatedAt = DateTime.UtcNow;
        appointment.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return Ok(new
        {
            Message = "Appointment cancelled successfully",
            AppointmentId = appointment.Id,
            Status = appointment.Status
        });
    }

    /// <summary>
    /// Delete an appointment (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAppointment(Guid id)
    {
        var appointment = await _context.Appointments
            .Where(a => a.Id == id && a.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return NotFound(new { Message = "Appointment not found" });
        }

        if (!await IsUserMemberOfHousehold(appointment.HouseholdId))
        {
            return Forbid();
        }

        appointment.DeletedAt = DateTime.UtcNow;
        appointment.UpdatedAt = DateTime.UtcNow;
        appointment.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }
}

