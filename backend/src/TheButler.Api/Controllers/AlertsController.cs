using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;
using TheButler.Api.DTOs;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlertsController : ControllerBase
    {
        private readonly TheButlerDbContext _context;
        private readonly ILogger<AlertsController> _logger;

        public AlertsController(
            TheButlerDbContext context,
            ILogger<AlertsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetUserId()
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
            var userId = GetUserId();
            return await _context.HouseholdMembers
                .AnyAsync(hm => hm.HouseholdId == householdId 
                             && hm.UserId == userId 
                             && hm.IsActive == true);
        }

        // ==================== CORE CRUD OPERATIONS ====================

        /// <summary>
        /// Get all alerts for a household with optional filtering
        /// </summary>
        [HttpGet("household/{householdId}")]
        public async Task<ActionResult<IEnumerable<AlertResponseDto>>> GetAlerts(
            Guid householdId,
            [FromQuery] string? status = null,
            [FromQuery] string? category = null,
            [FromQuery] string? severity = null,
            [FromQuery] bool? isRead = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                // Verify household exists and user has access
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var query = _context.Alerts
                    .Where(a => a.HouseholdId == householdId);

                // Apply filters
                if (!string.IsNullOrEmpty(status))
                    query = query.Where(a => a.Status == status);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(a => a.Category == category);

                if (!string.IsNullOrEmpty(severity))
                    query = query.Where(a => a.Severity == severity);

                if (isRead.HasValue)
                    query = query.Where(a => a.IsRead == isRead.Value);

                // Order by priority and creation date
                var alerts = await query
                    .OrderByDescending(a => a.Priority)
                    .ThenByDescending(a => a.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var response = alerts.Select(MapToResponseDto).ToList();
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while retrieving alerts" });
            }
        }

        /// <summary>
        /// Get a single alert by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<AlertResponseDto>> GetAlert(Guid id)
        {
            try
            {
                var alert = await _context.Alerts.FindAsync(id);
                if (alert == null)
                    return NotFound(new { message = "Alert not found" });

                return Ok(MapToResponseDto(alert));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alert {AlertId}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the alert" });
            }
        }

        /// <summary>
        /// Create a new alert
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<AlertResponseDto>> CreateAlert([FromBody] CreateAlertDto dto)
        {
            try
            {
                // Get householdId from user's claim or default household
                var userId = GetUserId();
                var household = await _context.Households
                    .Include(h => h.HouseholdMembers)
                    .FirstOrDefaultAsync(h => h.HouseholdMembers.Any(hm => hm.UserId == userId));

                if (household == null)
                    return BadRequest(new { message = "User is not associated with any household" });

                var alert = new Alerts
                {
                    Id = Guid.NewGuid(),
                    HouseholdId = household.Id,
                    Type = dto.Type,
                    Category = dto.Category,
                    Severity = dto.Severity,
                    Priority = dto.Priority,
                    Title = dto.Title,
                    Message = dto.Message,
                    Description = dto.Description,
                    RelatedEntityType = dto.RelatedEntityType,
                    RelatedEntityId = dto.RelatedEntityId,
                    RelatedEntityName = dto.RelatedEntityName,
                    Status = AlertStatus.Active,
                    IsRead = false,
                    IsDismissed = false,
                    CreatedAt = DateTime.UtcNow,
                    ActionUrl = dto.ActionUrl,
                    ActionLabel = dto.ActionLabel,
                    ExpiresAt = dto.ExpiresAt,
                    IsRecurring = dto.IsRecurring,
                    RecurrenceRule = dto.RecurrenceRule,
                    NextOccurrence = dto.NextOccurrence
                };

                _context.Alerts.Add(alert);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Alert {AlertId} created for household {HouseholdId}", alert.Id, household.Id);
                return CreatedAtAction(nameof(GetAlert), new { id = alert.Id }, MapToResponseDto(alert));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating alert");
                return StatusCode(500, new { message = "An error occurred while creating the alert" });
            }
        }

        /// <summary>
        /// Update an alert
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<AlertResponseDto>> UpdateAlert(Guid id, [FromBody] UpdateAlertDto dto)
        {
            try
            {
                var alert = await _context.Alerts.FindAsync(id);
                if (alert == null)
                    return NotFound(new { message = "Alert not found" });

                // Update fields if provided
                if (dto.Type != null) alert.Type = dto.Type;
                if (dto.Category != null) alert.Category = dto.Category;
                if (dto.Severity != null) alert.Severity = dto.Severity;
                if (dto.Priority.HasValue) alert.Priority = dto.Priority.Value;
                if (dto.Title != null) alert.Title = dto.Title;
                if (dto.Message != null) alert.Message = dto.Message;
                if (dto.Description != null) alert.Description = dto.Description;
                if (dto.RelatedEntityType != null) alert.RelatedEntityType = dto.RelatedEntityType;
                if (dto.RelatedEntityId.HasValue) alert.RelatedEntityId = dto.RelatedEntityId;
                if (dto.RelatedEntityName != null) alert.RelatedEntityName = dto.RelatedEntityName;
                if (dto.Status != null) alert.Status = dto.Status;
                if (dto.IsRead.HasValue) alert.IsRead = dto.IsRead.Value;
                if (dto.IsDismissed.HasValue) alert.IsDismissed = dto.IsDismissed.Value;
                if (dto.ActionUrl != null) alert.ActionUrl = dto.ActionUrl;
                if (dto.ActionLabel != null) alert.ActionLabel = dto.ActionLabel;
                if (dto.ExpiresAt.HasValue) alert.ExpiresAt = dto.ExpiresAt;
                if (dto.IsRecurring.HasValue) alert.IsRecurring = dto.IsRecurring.Value;
                if (dto.RecurrenceRule != null) alert.RecurrenceRule = dto.RecurrenceRule;
                if (dto.NextOccurrence.HasValue) alert.NextOccurrence = dto.NextOccurrence;

                alert.UpdatedAt = DateTime.UtcNow;

                _context.Alerts.Update(alert);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Alert {AlertId} updated", id);
                return Ok(MapToResponseDto(alert));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating alert {AlertId}", id);
                return StatusCode(500, new { message = "An error occurred while updating the alert" });
            }
        }

        /// <summary>
        /// Delete an alert
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlert(Guid id)
        {
            try
            {
                var alert = await _context.Alerts.FindAsync(id);
                if (alert == null)
                    return NotFound(new { message = "Alert not found" });

                alert.DeletedAt = DateTime.UtcNow;
                _context.Alerts.Update(alert);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Alert {AlertId} deleted", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting alert {AlertId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the alert" });
            }
        }

        // ==================== STATUS MANAGEMENT ENDPOINTS ====================

        /// <summary>
        /// Mark an alert as read
        /// </summary>
        [HttpPost("{id}/mark-read")]
        public async Task<ActionResult<AlertResponseDto>> MarkAsRead(Guid id)
        {
            try
            {
                var alert = await _context.Alerts.FindAsync(id);
                if (alert == null)
                    return NotFound(new { message = "Alert not found" });

                alert.IsRead = true;
                alert.ReadAt = DateTime.UtcNow;
                alert.Status = AlertStatus.Read;
                alert.UpdatedAt = DateTime.UtcNow;

                _context.Alerts.Update(alert);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Alert {AlertId} marked as read", id);
                return Ok(MapToResponseDto(alert));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking alert {AlertId} as read", id);
                return StatusCode(500, new { message = "An error occurred while marking the alert as read" });
            }
        }

        /// <summary>
        /// Dismiss an alert
        /// </summary>
        [HttpPost("{id}/dismiss")]
        public async Task<ActionResult<AlertResponseDto>> Dismiss(Guid id)
        {
            try
            {
                var alert = await _context.Alerts.FindAsync(id);
                if (alert == null)
                    return NotFound(new { message = "Alert not found" });

                alert.IsDismissed = true;
                alert.DismissedAt = DateTime.UtcNow;
                alert.Status = AlertStatus.Dismissed;
                alert.UpdatedAt = DateTime.UtcNow;

                _context.Alerts.Update(alert);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Alert {AlertId} dismissed", id);
                return Ok(MapToResponseDto(alert));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error dismissing alert {AlertId}", id);
                return StatusCode(500, new { message = "An error occurred while dismissing the alert" });
            }
        }

        /// <summary>
        /// Mark all alerts as read for a household
        /// </summary>
        [HttpPost("household/{householdId}/mark-all-read")]
        public async Task<ActionResult<BulkOperationResultDto>> MarkAllRead(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var unreadAlerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId && !a.IsRead)
                    .ToListAsync();

                foreach (var alert in unreadAlerts)
                {
                    alert.IsRead = true;
                    alert.ReadAt = DateTime.UtcNow;
                    alert.Status = AlertStatus.Read;
                    alert.UpdatedAt = DateTime.UtcNow;
                    _context.Alerts.Update(alert);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("{Count} alerts marked as read for household {HouseholdId}", unreadAlerts.Count, householdId);
                return Ok(new BulkOperationResultDto
                {
                    Count = unreadAlerts.Count,
                    Operation = "MarkAllRead",
                    OperationAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all alerts as read for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while marking alerts as read" });
            }
        }

        /// <summary>
        /// Dismiss all alerts for a household
        /// </summary>
        [HttpPost("household/{householdId}/dismiss-all")]
        public async Task<ActionResult<BulkOperationResultDto>> DismissAll(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var activeAlerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId && !a.IsDismissed)
                    .ToListAsync();

                foreach (var alert in activeAlerts)
                {
                    alert.IsDismissed = true;
                    alert.DismissedAt = DateTime.UtcNow;
                    alert.Status = AlertStatus.Dismissed;
                    alert.UpdatedAt = DateTime.UtcNow;
                    _context.Alerts.Update(alert);
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("{Count} alerts dismissed for household {HouseholdId}", activeAlerts.Count, householdId);
                return Ok(new BulkOperationResultDto
                {
                    Count = activeAlerts.Count,
                    Operation = "DismissAll",
                    OperationAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error dismissing all alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while dismissing alerts" });
            }
        }

        // ==================== FILTERING & QUERY ENDPOINTS ====================

        /// <summary>
        /// Get unread alerts for a household
        /// </summary>
        [HttpGet("household/{householdId}/unread")]
        public async Task<ActionResult<IEnumerable<AlertResponseDto>>> GetUnreadAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var alerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId && !a.IsRead)
                    .OrderByDescending(a => a.Priority)
                    .ThenByDescending(a => a.CreatedAt)
                    .ToListAsync();

                return Ok(alerts.Select(MapToResponseDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unread alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while retrieving unread alerts" });
            }
        }

        /// <summary>
        /// Get alerts by category
        /// </summary>
        [HttpGet("household/{householdId}/category/{category}")]
        public async Task<ActionResult<IEnumerable<AlertResponseDto>>> GetByCategory(Guid householdId, string category)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var alerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId && a.Category == category)
                    .OrderByDescending(a => a.Priority)
                    .ThenByDescending(a => a.CreatedAt)
                    .ToListAsync();

                return Ok(alerts.Select(MapToResponseDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alerts by category for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while retrieving alerts" });
            }
        }

        /// <summary>
        /// Get alerts by severity
        /// </summary>
        [HttpGet("household/{householdId}/severity/{severity}")]
        public async Task<ActionResult<IEnumerable<AlertResponseDto>>> GetBySeverity(Guid householdId, string severity)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var alerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId && a.Severity == severity)
                    .OrderByDescending(a => a.Priority)
                    .ThenByDescending(a => a.CreatedAt)
                    .ToListAsync();

                return Ok(alerts.Select(MapToResponseDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alerts by severity for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while retrieving alerts" });
            }
        }

        /// <summary>
        /// Get active alerts (not dismissed, expired, or archived)
        /// </summary>
        [HttpGet("household/{householdId}/active")]
        public async Task<ActionResult<IEnumerable<AlertResponseDto>>> GetActiveAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var alerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId 
                        && !a.IsDismissed 
                        && a.Status != AlertStatus.Expired 
                        && a.Status != AlertStatus.Archived)
                    .OrderByDescending(a => a.Priority)
                    .ThenByDescending(a => a.CreatedAt)
                    .ToListAsync();

                return Ok(alerts.Select(MapToResponseDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while retrieving active alerts" });
            }
        }

        /// <summary>
        /// Get alert statistics for a household
        /// </summary>
        [HttpGet("household/{householdId}/stats")]
        public async Task<ActionResult<AlertStatsDto>> GetStats(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var alerts = await _context.Alerts
                    .Where(a => a.HouseholdId == householdId)
                    .ToListAsync();

                var stats = new AlertStatsDto
                {
                    TotalAlerts = alerts.Count,
                    UnreadAlerts = alerts.Count(a => !a.IsRead),
                    CriticalAlerts = alerts.Count(a => a.Severity == AlertSeverity.Critical),
                    HighPriorityAlerts = alerts.Count(a => a.Priority >= AlertPriority.High),
                    AlertsByCategory = alerts.GroupBy(a => a.Category)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    AlertsBySeverity = alerts.GroupBy(a => a.Severity)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    AlertsByStatus = alerts.GroupBy(a => a.Status)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    ActiveAlerts = alerts.Count(a => !a.IsDismissed && a.Status != AlertStatus.Expired && a.Status != AlertStatus.Archived),
                    DismissedAlerts = alerts.Count(a => a.IsDismissed),
                    ExpiredAlerts = alerts.Count(a => a.Status == AlertStatus.Expired)
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving alert statistics for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while retrieving statistics" });
            }
        }

        // ==================== ALERT GENERATION ENDPOINTS ====================

        /// <summary>
        /// Generate alerts for bills
        /// </summary>
        [HttpPost("generate/bills/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateBillAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var now = DateTime.UtcNow;
                var bills = await _context.Bills
                    .Where(b => b.HouseholdId == householdId && b.Status == "Pending")
                    .ToListAsync();

                int generated = 0;

                foreach (var bill in bills)
                {
                    var daysUntilDue = (bill.DueDate.ToDateTime(TimeOnly.MinValue) - now).Days;

                    // Skip if alert already exists for this bill
                    var existingAlert = await _context.Alerts
                        .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                            && a.RelatedEntityType == "Bill" 
                            && a.RelatedEntityId == bill.Id
                            && a.CreatedAt.Date == now.Date);

                    if (existingAlert != null) continue;

                    Alerts? alert = null;

                    if (daysUntilDue == 7)
                    {
                        alert = CreateAlert(householdId, AlertType.Reminder, AlertCategory.Bills, AlertSeverity.Medium, AlertPriority.Medium,
                            "Bill Due Soon", $"{bill.Name} ({bill.Amount:C}) is due in 7 days",
                            "Bill", bill.Id, bill.Name, $"/bills?id={bill.Id}", "View Bill");
                    }
                    else if (daysUntilDue == 3)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Bills, AlertSeverity.High, AlertPriority.High,
                            "Bill Due This Week", $"{bill.Name} ({bill.Amount:C}) is due in 3 days",
                            "Bill", bill.Id, bill.Name, $"/bills?id={bill.Id}", "View Bill");
                    }
                    else if (daysUntilDue == 0)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Bills, AlertSeverity.Critical, AlertPriority.Urgent,
                            "Bill Due Today", $"{bill.Name} ({bill.Amount:C}) is due today",
                            "Bill", bill.Id, bill.Name, $"/bills?id={bill.Id}", "Pay Bill");
                    }
                    else if (daysUntilDue < 0)
                    {
                        alert = CreateAlert(householdId, AlertType.Error, AlertCategory.Bills, AlertSeverity.Critical, AlertPriority.Urgent,
                            "Bill Overdue", $"{bill.Name} ({bill.Amount:C}) is {Math.Abs(daysUntilDue)} day(s) overdue",
                            "Bill", bill.Id, bill.Name, $"/bills?id={bill.Id}", "Pay Now");
                    }

                    if (alert != null)
                    {
                        _context.Alerts.Add(alert);
                        generated++;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Generated {Count} bill alerts for household {HouseholdId}", generated, householdId);
                return Ok(new AlertGenerationResultDto
                {
                    Generated = generated,
                    Category = "Bills",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating bill alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating bill alerts" });
            }
        }

        /// <summary>
        /// Generate alerts for maintenance tasks
        /// </summary>
        [HttpPost("generate/maintenance/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateMaintenanceAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var now = DateTime.UtcNow;
                var tasks = await _context.MaintenanceTasks
                    .Where(t => t.HouseholdId == householdId && t.Status != "Completed")
                    .ToListAsync();

                int generated = 0;

                foreach (var task in tasks)
                {
                    var daysUntilDue = (task.DueDate.ToDateTime(TimeOnly.MinValue) - now).Days;

                    var existingAlert = await _context.Alerts
                        .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                            && a.RelatedEntityType == "Maintenance" 
                            && a.RelatedEntityId == task.Id
                            && a.CreatedAt.Date == now.Date);

                    if (existingAlert != null) continue;

                    Alerts? alert = null;

                    if (daysUntilDue == 7)
                    {
                        alert = CreateAlert(householdId, AlertType.Reminder, AlertCategory.Maintenance, AlertSeverity.Medium, AlertPriority.Medium,
                            "Maintenance Task Due Soon", $"{task.Title} is due in 7 days",
                            "Maintenance", task.Id, task.Title, $"/maintenance?id={task.Id}", "View Task");
                    }
                    else if (daysUntilDue == 3)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Maintenance, AlertSeverity.High, AlertPriority.High,
                            "Maintenance Task Due This Week", $"{task.Title} is due in 3 days",
                            "Maintenance", task.Id, task.Title, $"/maintenance?id={task.Id}", "View Task");
                    }
                    else if (daysUntilDue < 0)
                    {
                        alert = CreateAlert(householdId, AlertType.Error, AlertCategory.Maintenance, AlertSeverity.High, AlertPriority.High,
                            "Maintenance Task Overdue", $"{task.Title} is {Math.Abs(daysUntilDue)} day(s) overdue",
                            "Maintenance", task.Id, task.Title, $"/maintenance?id={task.Id}", "Complete Task");
                    }

                    if (alert != null)
                    {
                        _context.Alerts.Add(alert);
                        generated++;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Generated {Count} maintenance alerts for household {HouseholdId}", generated, householdId);
                return Ok(new AlertGenerationResultDto
                {
                    Generated = generated,
                    Category = "Maintenance",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating maintenance alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating maintenance alerts" });
            }
        }

        /// <summary>
        /// Generate alerts for healthcare appointments
        /// </summary>
        [HttpPost("generate/healthcare/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateHealthcareAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var now = DateTime.UtcNow;
                int generated = 0;

                // Generate appointment alerts
                var appointments = await _context.Appointments
                    .Where(a => a.HouseholdId == householdId && a.AppointmentDate >= DateOnly.FromDateTime(now))
                    .ToListAsync();

                foreach (var appointment in appointments)
                {
                    var appointmentDateTime = appointment.AppointmentDate.ToDateTime(appointment.AppointmentTime ?? TimeOnly.MinValue);
                    var daysUntilAppointment = (appointmentDateTime - now).Days;

                    var existingAlert = await _context.Alerts
                        .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                            && a.RelatedEntityType == "Appointment" 
                            && a.RelatedEntityId == appointment.Id
                            && a.CreatedAt.Date == now.Date);

                    if (existingAlert != null) continue;

                    Alerts? alert = null;

                    if (daysUntilAppointment == 7)
                    {
                        alert = CreateAlert(householdId, AlertType.Reminder, AlertCategory.Healthcare, AlertSeverity.Medium, AlertPriority.Medium,
                            "Appointment Next Week", $"Appointment with {appointment.ProviderName} in 7 days",
                            "Appointment", appointment.Id, appointment.ProviderName, $"/healthcare/appointments?id={appointment.Id}", "View Details");
                    }
                    else if (daysUntilAppointment == 3)
                    {
                        alert = CreateAlert(householdId, AlertType.Reminder, AlertCategory.Healthcare, AlertSeverity.High, AlertPriority.High,
                            "Appointment This Week", $"Appointment with {appointment.ProviderName} in 3 days",
                            "Appointment", appointment.Id, appointment.ProviderName, $"/healthcare/appointments?id={appointment.Id}", "View Details");
                    }
                    else if (daysUntilAppointment == 1)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Healthcare, AlertSeverity.High, AlertPriority.High,
                            "Appointment Tomorrow", $"Appointment with {appointment.ProviderName} tomorrow at {appointmentDateTime:t}",
                            "Appointment", appointment.Id, appointment.ProviderName, $"/healthcare/appointments?id={appointment.Id}", "View Details");
                    }

                    if (alert != null)
                    {
                        _context.Alerts.Add(alert);
                        generated++;
                    }
                }

                // Generate medication refill alerts
                var medications = await _context.Medications
                    .Where(m => m.HouseholdId == householdId && m.IsActive == true)
                    .ToListAsync();

                foreach (var medication in medications)
                {
                    if (medication.RefillsRemaining.HasValue && medication.RefillsRemaining.Value <= 2)
                    {
                        var existingAlert = await _context.Alerts
                            .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                                && a.RelatedEntityType == "Medication" 
                                && a.RelatedEntityId == medication.Id
                                && a.CreatedAt.Date == now.Date);

                        if (existingAlert == null)
                        {
                            var alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Healthcare, AlertSeverity.Medium, AlertPriority.Medium,
                                "Prescription Refill Needed", $"{medication.Name} - {medication.RefillsRemaining} refill(s) remaining",
                                "Medication", medication.Id, medication.Name, $"/healthcare/medications?id={medication.Id}", "Request Refill");

                            _context.Alerts.Add(alert);
                            generated++;
                        }
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Generated {Count} healthcare alerts for household {HouseholdId}", generated, householdId);
                return Ok(new AlertGenerationResultDto
                {
                    Generated = generated,
                    Category = "Healthcare",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating healthcare alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating healthcare alerts" });
            }
        }

        /// <summary>
        /// Generate alerts for insurance policies
        /// </summary>
        [HttpPost("generate/insurance/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateInsuranceAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var now = DateTime.UtcNow;
                var policies = await _context.InsurancePolicies
                    .Where(p => p.HouseholdId == householdId && p.RenewalDate >= DateOnly.FromDateTime(now))
                    .ToListAsync();

                int generated = 0;

                foreach (var policy in policies)
                {
                    var daysUntilExpiry = (policy.RenewalDate.ToDateTime(TimeOnly.MinValue) - now).Days;

                    var existingAlert = await _context.Alerts
                        .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                            && a.RelatedEntityType == "Insurance" 
                            && a.RelatedEntityId == policy.Id
                            && a.CreatedAt.Date == now.Date);

                    if (existingAlert != null) continue;

                    Alerts? alert = null;

                    if (daysUntilExpiry == 60)
                    {
                        alert = CreateAlert(householdId, AlertType.Reminder, AlertCategory.Insurance, AlertSeverity.Medium, AlertPriority.Medium,
                            "Insurance Policy Expiring Soon", $"{policy.Provider} (Policy #{policy.PolicyNumber}) expires in 60 days",
                            "Insurance", policy.Id, policy.Provider, $"/insurance?id={policy.Id}", "Review Policy");
                    }
                    else if (daysUntilExpiry == 30)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Insurance, AlertSeverity.High, AlertPriority.High,
                            "Insurance Policy Expiring", $"{policy.Provider} (Policy #{policy.PolicyNumber}) expires in 30 days",
                            "Insurance", policy.Id, policy.Provider, $"/insurance?id={policy.Id}", "Renew Policy");
                    }
                    else if (daysUntilExpiry == 7)
                    {
                        alert = CreateAlert(householdId, AlertType.Error, AlertCategory.Insurance, AlertSeverity.Critical, AlertPriority.Urgent,
                            "Insurance Policy Expiring This Week", $"{policy.Provider} (Policy #{policy.PolicyNumber}) expires in 7 days",
                            "Insurance", policy.Id, policy.Provider, $"/insurance?id={policy.Id}", "Renew Now");
                    }

                    if (alert != null)
                    {
                        _context.Alerts.Add(alert);
                        generated++;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Generated {Count} insurance alerts for household {HouseholdId}", generated, householdId);
                return Ok(new AlertGenerationResultDto
                {
                    Generated = generated,
                    Category = "Insurance",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating insurance alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating insurance alerts" });
            }
        }

        /// <summary>
        /// Generate alerts for documents
        /// </summary>
        [HttpPost("generate/documents/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateDocumentAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var now = DateTime.UtcNow;
                var documents = await _context.Documents
                    .Where(d => d.HouseholdId == householdId && d.ExpiryDate.HasValue)
                    .ToListAsync();

                int generated = 0;

                foreach (var document in documents)
                {
                    if (!document.ExpiryDate.HasValue) continue;

                    var daysUntilExpiry = (document.ExpiryDate.Value.ToDateTime(TimeOnly.MinValue) - now).Days;

                    var existingAlert = await _context.Alerts
                        .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                            && a.RelatedEntityType == "Document" 
                            && a.RelatedEntityId == document.Id
                            && a.CreatedAt.Date == now.Date);

                    if (existingAlert != null) continue;

                    Alerts? alert = null;

                    if (daysUntilExpiry == 30)
                    {
                        alert = CreateAlert(householdId, AlertType.Reminder, AlertCategory.Documents, AlertSeverity.Medium, AlertPriority.Medium,
                            "Document Expiring Soon", $"{document.Title} expires in 30 days",
                            "Document", document.Id, document.Title, $"/documents?id={document.Id}", "View Document");
                    }
                    else if (daysUntilExpiry == 7)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Documents, AlertSeverity.High, AlertPriority.High,
                            "Document Expiring This Week", $"{document.Title} expires in 7 days",
                            "Document", document.Id, document.Title, $"/documents?id={document.Id}", "Renew Document");
                    }

                    if (alert != null)
                    {
                        _context.Alerts.Add(alert);
                        generated++;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Generated {Count} document alerts for household {HouseholdId}", generated, householdId);
                return Ok(new AlertGenerationResultDto
                {
                    Generated = generated,
                    Category = "Documents",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating document alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating document alerts" });
            }
        }

        /// <summary>
        /// Generate alerts for inventory
        /// NOTE: Inventory alerts are currently disabled because the InventoryItems model
        /// does not have CurrentQuantity, MinimumQuantity, or ExpiryDate properties.
        /// These need to be added to the model before inventory alerts can be generated.
        /// </summary>
        [HttpPost("generate/inventory/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateInventoryAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                // TODO: Add CurrentQuantity, MinimumQuantity, and ExpiryDate to InventoryItems model
                // then implement inventory alerts
                
                _logger.LogInformation("Inventory alerts skipped - properties not available in model");
                return Ok(new AlertGenerationResultDto
                {
                    Generated = 0,
                    Category = "Inventory",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating inventory alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating inventory alerts" });
            }
        }

        /// <summary>
        /// Generate alerts for budgets
        /// </summary>
        [HttpPost("generate/budget/{householdId}")]
        public async Task<ActionResult<AlertGenerationResultDto>> GenerateBudgetAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var now = DateTime.UtcNow;
                var budgets = await _context.Budgets
                    .Include(b => b.BudgetPeriods)
                    .Where(b => b.HouseholdId == householdId)
                    .ToListAsync();

                int generated = 0;

                foreach (var budget in budgets)
                {
                    var nowDate = DateOnly.FromDateTime(now);
                    var currentPeriod = budget.BudgetPeriods
                        .FirstOrDefault(p => p.PeriodStart <= nowDate && p.PeriodEnd >= nowDate);

                    if (currentPeriod == null) continue;

                    // Get spending for current period
                    var spending = await _context.Transactions
                        .Where(t => t.HouseholdId == householdId
                            && t.CategoryId == budget.CategoryId
                            && t.Date >= currentPeriod.PeriodStart
                            && t.Date <= currentPeriod.PeriodEnd)
                        .SumAsync(t => t.Amount);

                    if (budget.LimitAmount <= 0) continue;

                    var percentageUsed = (spending / budget.LimitAmount) * 100;

                    var existingAlert = await _context.Alerts
                        .FirstOrDefaultAsync(a => a.HouseholdId == householdId 
                            && a.RelatedEntityType == "Budget" 
                            && a.RelatedEntityId == budget.Id
                            && a.CreatedAt.Date == now.Date);

                    if (existingAlert != null) continue;

                    Alerts? alert = null;

                    if (percentageUsed >= 100)
                    {
                        alert = CreateAlert(householdId, AlertType.Error, AlertCategory.Budget, AlertSeverity.Critical, AlertPriority.Urgent,
                            "Budget Exceeded", $"{budget.Name} budget exceeded ({spending:C} of {budget.LimitAmount:C})",
                            "Budget", budget.Id, budget.Name, $"/budgets?id={budget.Id}", "Review Budget");
                    }
                    else if (percentageUsed >= 90)
                    {
                        alert = CreateAlert(householdId, AlertType.Error, AlertCategory.Budget, AlertSeverity.High, AlertPriority.High,
                            "Budget Limit Reached", $"{budget.Name} budget at {percentageUsed:F0}% ({spending:C} of {budget.LimitAmount:C})",
                            "Budget", budget.Id, budget.Name, $"/budgets?id={budget.Id}", "Review Budget");
                    }
                    else if (percentageUsed >= 80)
                    {
                        alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Budget, AlertSeverity.Medium, AlertPriority.Medium,
                            "Budget Warning", $"{budget.Name} budget at {percentageUsed:F0}% ({spending:C} of {budget.LimitAmount:C})",
                            "Budget", budget.Id, budget.Name, $"/budgets?id={budget.Id}", "Review Budget");
                    }

                    if (alert != null)
                    {
                        _context.Alerts.Add(alert);
                        generated++;
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Generated {Count} budget alerts for household {HouseholdId}", generated, householdId);
                return Ok(new AlertGenerationResultDto
                {
                    Generated = generated,
                    Category = "Budget",
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating budget alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating budget alerts" });
            }
        }

        /// <summary>
        /// Generate all alerts for a household
        /// </summary>
        [HttpPost("generate/all/{householdId}")]
        public async Task<ActionResult<AllAlertsGenerationResultDto>> GenerateAllAlerts(Guid householdId)
        {
            try
            {
                if (!await IsUserMemberOfHousehold(householdId))
                    return Forbid();

                var byCategory = new Dictionary<string, int>();

                // Generate all categories
                var billResult = await GenerateBillAlerts(householdId);
                byCategory["Bills"] = billResult.Value?.Generated ?? 0;

                var maintenanceResult = await GenerateMaintenanceAlerts(householdId);
                byCategory["Maintenance"] = maintenanceResult.Value?.Generated ?? 0;

                var healthcareResult = await GenerateHealthcareAlerts(householdId);
                byCategory["Healthcare"] = healthcareResult.Value?.Generated ?? 0;

                var insuranceResult = await GenerateInsuranceAlerts(householdId);
                byCategory["Insurance"] = insuranceResult.Value?.Generated ?? 0;

                var documentResult = await GenerateDocumentAlerts(householdId);
                byCategory["Documents"] = documentResult.Value?.Generated ?? 0;

                var inventoryResult = await GenerateInventoryAlerts(householdId);
                byCategory["Inventory"] = inventoryResult.Value?.Generated ?? 0;

                var budgetResult = await GenerateBudgetAlerts(householdId);
                byCategory["Budget"] = budgetResult.Value?.Generated ?? 0;

                var totalGenerated = byCategory.Values.Sum();

                _logger.LogInformation("Generated {TotalCount} total alerts for household {HouseholdId}", totalGenerated, householdId);
                return Ok(new AllAlertsGenerationResultDto
                {
                    TotalGenerated = totalGenerated,
                    ByCategory = byCategory,
                    GeneratedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating all alerts for household {HouseholdId}", householdId);
                return StatusCode(500, new { message = "An error occurred while generating alerts" });
            }
        }

        // ==================== HELPER METHODS ====================

        private Alerts CreateAlert(Guid householdId, string type, string category, string severity, int priority,
            string title, string message, string? relatedEntityType = null, Guid? relatedEntityId = null,
            string? relatedEntityName = null, string? actionUrl = null, string? actionLabel = null)
        {
            return new Alerts
            {
                Id = Guid.NewGuid(),
                HouseholdId = householdId,
                Type = type,
                Category = category,
                Severity = severity,
                Priority = priority,
                Title = title,
                Message = message,
                RelatedEntityType = relatedEntityType,
                RelatedEntityId = relatedEntityId,
                RelatedEntityName = relatedEntityName,
                Status = AlertStatus.Active,
                IsRead = false,
                IsDismissed = false,
                CreatedAt = DateTime.UtcNow,
                ActionUrl = actionUrl,
                ActionLabel = actionLabel
            };
        }

        private AlertResponseDto MapToResponseDto(Alerts alert)
        {
            return new AlertResponseDto
            {
                Id = alert.Id,
                HouseholdId = alert.HouseholdId,
                Type = alert.Type,
                Category = alert.Category,
                Severity = alert.Severity,
                Priority = alert.Priority,
                Title = alert.Title,
                Message = alert.Message,
                Description = alert.Description,
                RelatedEntityType = alert.RelatedEntityType,
                RelatedEntityId = alert.RelatedEntityId,
                RelatedEntityName = alert.RelatedEntityName,
                Status = alert.Status,
                IsRead = alert.IsRead,
                IsDismissed = alert.IsDismissed,
                CreatedAt = alert.CreatedAt,
                ReadAt = alert.ReadAt,
                DismissedAt = alert.DismissedAt,
                ExpiresAt = alert.ExpiresAt,
                ActionUrl = alert.ActionUrl,
                ActionLabel = alert.ActionLabel,
                IsRecurring = alert.IsRecurring,
                RecurrenceRule = alert.RecurrenceRule,
                NextOccurrence = alert.NextOccurrence,
                UpdatedAt = alert.UpdatedAt
            };
        }
    }
}

