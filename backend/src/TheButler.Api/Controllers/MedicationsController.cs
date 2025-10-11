using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Api.DTOs;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers;

/// <summary>
/// Controller for managing medications and medication schedules
/// </summary>
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MedicationsController : ControllerBase
{
    private readonly TheButlerDbContext _context;

    public MedicationsController(TheButlerDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get the current authenticated user's ID from JWT token
    /// </summary>
    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("Invalid token - no user ID found");
        }
        return Guid.Parse(userIdClaim);
    }

    /// <summary>
    /// Check if user is a member of the specified household
    /// </summary>
    private async Task<bool> IsUserMemberOfHousehold(Guid householdId)
    {
        var userId = GetCurrentUserId();
        return await _context.HouseholdMembers
            .AnyAsync(hm => hm.HouseholdId == householdId 
                         && hm.UserId == userId 
                         && hm.IsActive == true);
    }

    #region Medications

    /// <summary>
    /// Get all medications for a household
    /// </summary>
    [HttpGet("household/{householdId}")]
    [ProducesResponseType(typeof(List<MedicationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetHouseholdMedications(
        Guid householdId,
        [FromQuery] Guid? householdMemberId = null,
        [FromQuery] bool? isActive = null)
    {
        if (!await IsUserMemberOfHousehold(householdId))
        {
            return Forbid();
        }

        var query = _context.Medications
            .Include(m => m.Provider)
            .Where(m => m.HouseholdId == householdId && m.DeletedAt == null);

        if (householdMemberId.HasValue)
            query = query.Where(m => m.HouseholdMemberId == householdMemberId.Value);

        if (isActive.HasValue)
            query = query.Where(m => m.IsActive == isActive.Value);

        var medications = await query
            .OrderBy(m => m.Name)
            .Select(m => new MedicationResponseDto(
                m.Id,
                m.HouseholdId,
                m.HouseholdMemberId,
                null, // Will need to join with HouseholdMembers if needed
                m.ProviderId,
                m.Provider != null ? m.Provider.Name : null,
                m.Name,
                m.GenericName,
                m.Dosage,
                m.Frequency,
                m.Route,
                m.Reason,
                m.StartDate,
                m.EndDate,
                m.IsActive ?? true,
                m.IsPrescription ?? false,
                m.PrescriptionNumber,
                m.RefillsRemaining,
                m.Pharmacy,
                m.PharmacyPhone,
                m.SideEffects,
                m.Instructions,
                m.Notes,
                m.CreatedAt,
                m.UpdatedAt
            ))
            .ToListAsync();

        return Ok(medications);
    }

    /// <summary>
    /// Get a specific medication by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MedicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMedication(Guid id)
    {
        var medication = await _context.Medications
            .Include(m => m.Provider)
            .Where(m => m.Id == id && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (medication == null)
        {
            return NotFound(new { Message = "Medication not found" });
        }

        if (!await IsUserMemberOfHousehold(medication.HouseholdId))
        {
            return Forbid();
        }

        var response = new MedicationResponseDto(
            medication.Id,
            medication.HouseholdId,
            medication.HouseholdMemberId,
            null,
            medication.ProviderId,
            medication.Provider?.Name,
            medication.Name,
            medication.GenericName,
            medication.Dosage,
            medication.Frequency,
            medication.Route,
            medication.Reason,
            medication.StartDate,
            medication.EndDate,
            medication.IsActive ?? true,
            medication.IsPrescription ?? false,
            medication.PrescriptionNumber,
            medication.RefillsRemaining,
            medication.Pharmacy,
            medication.PharmacyPhone,
            medication.SideEffects,
            medication.Instructions,
            medication.Notes,
            medication.CreatedAt,
            medication.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Create a new medication
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(MedicationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMedication([FromBody] CreateMedicationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest(new { Message = "Medication name is required" });
        }

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

        var medication = new Medications
        {
            Id = Guid.NewGuid(),
            HouseholdId = dto.HouseholdId,
            HouseholdMemberId = dto.HouseholdMemberId,
            ProviderId = dto.ProviderId,
            Name = dto.Name,
            GenericName = dto.GenericName,
            Dosage = dto.Dosage,
            Frequency = dto.Frequency,
            Route = dto.Route,
            Reason = dto.Reason,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            IsPrescription = dto.IsPrescription,
            PrescriptionNumber = dto.PrescriptionNumber,
            RefillsRemaining = dto.RefillsRemaining,
            Pharmacy = dto.Pharmacy,
            PharmacyPhone = dto.PharmacyPhone,
            SideEffects = dto.SideEffects,
            Instructions = dto.Instructions,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.Medications.Add(medication);
        await _context.SaveChangesAsync();

        var createdMedication = await _context.Medications
            .Include(m => m.Provider)
            .FirstAsync(m => m.Id == medication.Id);

        var response = new MedicationResponseDto(
            createdMedication.Id,
            createdMedication.HouseholdId,
            createdMedication.HouseholdMemberId,
            null,
            createdMedication.ProviderId,
            createdMedication.Provider?.Name,
            createdMedication.Name,
            createdMedication.GenericName,
            createdMedication.Dosage,
            createdMedication.Frequency,
            createdMedication.Route,
            createdMedication.Reason,
            createdMedication.StartDate,
            createdMedication.EndDate,
            createdMedication.IsActive ?? true,
            createdMedication.IsPrescription ?? false,
            createdMedication.PrescriptionNumber,
            createdMedication.RefillsRemaining,
            createdMedication.Pharmacy,
            createdMedication.PharmacyPhone,
            createdMedication.SideEffects,
            createdMedication.Instructions,
            createdMedication.Notes,
            createdMedication.CreatedAt,
            createdMedication.UpdatedAt
        );

        return CreatedAtAction(nameof(GetMedication), new { id = medication.Id }, response);
    }

    /// <summary>
    /// Update an existing medication
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MedicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMedication(Guid id, [FromBody] UpdateMedicationDto dto)
    {
        var medication = await _context.Medications
            .Include(m => m.Provider)
            .Where(m => m.Id == id && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (medication == null)
        {
            return NotFound(new { Message = "Medication not found" });
        }

        if (!await IsUserMemberOfHousehold(medication.HouseholdId))
        {
            return Forbid();
        }

        // Update fields
        if (dto.ProviderId.HasValue)
        {
            var providerExists = await _context.HealthcareProviders
                .AnyAsync(p => p.Id == dto.ProviderId.Value && p.HouseholdId == medication.HouseholdId);
            if (!providerExists)
            {
                return BadRequest(new { Message = "Invalid provider ID" });
            }
            medication.ProviderId = dto.ProviderId.Value;
        }

        if (dto.Name != null) medication.Name = dto.Name;
        if (dto.GenericName != null) medication.GenericName = dto.GenericName;
        if (dto.Dosage != null) medication.Dosage = dto.Dosage;
        if (dto.Frequency != null) medication.Frequency = dto.Frequency;
        if (dto.Route != null) medication.Route = dto.Route;
        if (dto.Reason != null) medication.Reason = dto.Reason;
        if (dto.StartDate.HasValue) medication.StartDate = dto.StartDate;
        if (dto.EndDate.HasValue) medication.EndDate = dto.EndDate;
        if (dto.IsActive.HasValue) medication.IsActive = dto.IsActive.Value;
        if (dto.IsPrescription.HasValue) medication.IsPrescription = dto.IsPrescription.Value;
        if (dto.PrescriptionNumber != null) medication.PrescriptionNumber = dto.PrescriptionNumber;
        if (dto.RefillsRemaining.HasValue) medication.RefillsRemaining = dto.RefillsRemaining;
        if (dto.Pharmacy != null) medication.Pharmacy = dto.Pharmacy;
        if (dto.PharmacyPhone != null) medication.PharmacyPhone = dto.PharmacyPhone;
        if (dto.SideEffects != null) medication.SideEffects = dto.SideEffects;
        if (dto.Instructions != null) medication.Instructions = dto.Instructions;
        if (dto.Notes != null) medication.Notes = dto.Notes;

        medication.UpdatedAt = DateTime.UtcNow;
        medication.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        await _context.Entry(medication).Reference(m => m.Provider).LoadAsync();

        var response = new MedicationResponseDto(
            medication.Id,
            medication.HouseholdId,
            medication.HouseholdMemberId,
            null,
            medication.ProviderId,
            medication.Provider?.Name,
            medication.Name,
            medication.GenericName,
            medication.Dosage,
            medication.Frequency,
            medication.Route,
            medication.Reason,
            medication.StartDate,
            medication.EndDate,
            medication.IsActive ?? true,
            medication.IsPrescription ?? false,
            medication.PrescriptionNumber,
            medication.RefillsRemaining,
            medication.Pharmacy,
            medication.PharmacyPhone,
            medication.SideEffects,
            medication.Instructions,
            medication.Notes,
            medication.CreatedAt,
            medication.UpdatedAt
        );

        return Ok(response);
    }

    /// <summary>
    /// Delete a medication (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMedication(Guid id)
    {
        var medication = await _context.Medications
            .Where(m => m.Id == id && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (medication == null)
        {
            return NotFound(new { Message = "Medication not found" });
        }

        if (!await IsUserMemberOfHousehold(medication.HouseholdId))
        {
            return Forbid();
        }

        medication.DeletedAt = DateTime.UtcNow;
        medication.UpdatedAt = DateTime.UtcNow;
        medication.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    #endregion

    #region Medication Schedules

    /// <summary>
    /// Get schedules for a medication
    /// </summary>
    [HttpGet("{medicationId}/schedules")]
    [ProducesResponseType(typeof(List<MedicationScheduleResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMedicationSchedules(Guid medicationId)
    {
        var medication = await _context.Medications
            .Where(m => m.Id == medicationId && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (medication == null)
        {
            return NotFound(new { Message = "Medication not found" });
        }

        if (!await IsUserMemberOfHousehold(medication.HouseholdId))
        {
            return Forbid();
        }

        var schedules = await _context.MedicationSchedules
            .Where(ms => ms.MedicationId == medicationId && ms.DeletedAt == null)
            .OrderBy(ms => ms.ScheduledTime)
            .Select(ms => new MedicationScheduleResponseDto(
                ms.Id,
                ms.MedicationId,
                medication.Name,
                ms.ScheduledTime,
                ms.DayOfWeek,
                ms.IsActive ?? true,
                ms.ReminderEnabled ?? true,
                ms.ReminderMinutesBefore,
                ms.Notes,
                ms.CreatedAt,
                ms.UpdatedAt
            ))
            .ToListAsync();

        return Ok(schedules);
    }

    /// <summary>
    /// Create a medication schedule
    /// </summary>
    [HttpPost("{medicationId}/schedules")]
    [ProducesResponseType(typeof(MedicationScheduleResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateMedicationSchedule(Guid medicationId, [FromBody] CreateMedicationScheduleDto dto)
    {
        var medication = await _context.Medications
            .Where(m => m.Id == medicationId && m.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (medication == null)
        {
            return NotFound(new { Message = "Medication not found" });
        }

        if (!await IsUserMemberOfHousehold(medication.HouseholdId))
        {
            return Forbid();
        }

        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow;

        var schedule = new MedicationSchedules
        {
            Id = Guid.NewGuid(),
            MedicationId = medicationId,
            ScheduledTime = dto.ScheduledTime,
            DayOfWeek = dto.DayOfWeek,
            IsActive = dto.IsActive,
            ReminderEnabled = dto.ReminderEnabled,
            ReminderMinutesBefore = dto.ReminderMinutesBefore,
            Notes = dto.Notes,
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };

        _context.MedicationSchedules.Add(schedule);
        await _context.SaveChangesAsync();

        var response = new MedicationScheduleResponseDto(
            schedule.Id,
            schedule.MedicationId,
            medication.Name,
            schedule.ScheduledTime,
            schedule.DayOfWeek,
            schedule.IsActive ?? true,
            schedule.ReminderEnabled ?? true,
            schedule.ReminderMinutesBefore,
            schedule.Notes,
            schedule.CreatedAt,
            schedule.UpdatedAt
        );

        return CreatedAtAction(nameof(GetMedicationSchedules), new { medicationId = medicationId }, response);
    }

    /// <summary>
    /// Delete a medication schedule
    /// </summary>
    [HttpDelete("schedules/{scheduleId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMedicationSchedule(Guid scheduleId)
    {
        var schedule = await _context.MedicationSchedules
            .Include(ms => ms.Medication)
            .Where(ms => ms.Id == scheduleId && ms.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (schedule == null)
        {
            return NotFound(new { Message = "Schedule not found" });
        }

        if (!await IsUserMemberOfHousehold(schedule.Medication.HouseholdId))
        {
            return Forbid();
        }

        schedule.DeletedAt = DateTime.UtcNow;
        schedule.UpdatedAt = DateTime.UtcNow;
        schedule.UpdatedBy = GetCurrentUserId();

        await _context.SaveChangesAsync();

        return NoContent();
    }

    #endregion
}

