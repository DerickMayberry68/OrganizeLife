using Microsoft.EntityFrameworkCore;
using TheButler.Core.Domain.Model;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Services
{
    /// <summary>
    /// Background service that automatically generates alerts for all active households
    /// V2: Direct database access instead of HTTP calls for better reliability
    /// </summary>
    public class AlertGenerationServiceV2 : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AlertGenerationServiceV2> _logger;
        private readonly IConfiguration _configuration;
        private TimeSpan _interval;

        public AlertGenerationServiceV2(
            IServiceProvider serviceProvider,
            ILogger<AlertGenerationServiceV2> logger,
            IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;

            // Read interval from configuration (default: 1 hour)
            var intervalMinutes = _configuration.GetValue<int>("AlertGeneration:IntervalMinutes", 60);
            _interval = TimeSpan.FromMinutes(intervalMinutes);

            _logger.LogInformation("AlertGenerationServiceV2 initialized with {IntervalMinutes} minute interval", intervalMinutes);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AlertGenerationServiceV2 started");

            // Optional: Wait a bit before first run to let the application fully start
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Starting alert generation cycle at {Time}", DateTime.UtcNow);
                    
                    await GenerateAlertsForAllHouseholds(stoppingToken);
                    
                    _logger.LogInformation("Alert generation cycle completed at {Time}", DateTime.UtcNow);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during alert generation cycle");
                }

                // Wait for next interval
                _logger.LogInformation("Next alert generation cycle in {Interval}", _interval);
                await Task.Delay(_interval, stoppingToken);
            }

            _logger.LogInformation("AlertGenerationServiceV2 stopped");
        }

        private async Task GenerateAlertsForAllHouseholds(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<TheButlerDbContext>();

            try
            {
                // Get all active households
                var households = await dbContext.Households
                    .Where(h => h.IsActive == true && h.DeletedAt == null)
                    .Select(h => h.Id)
                    .ToListAsync(cancellationToken);

                _logger.LogInformation("Found {Count} active households", households.Count);

                var totalGenerated = 0;
                var successCount = 0;
                var failureCount = 0;

                foreach (var householdId in households)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;

                    try
                    {
                        var generated = await GenerateAlertsForHousehold(householdId, dbContext, cancellationToken);
                        totalGenerated += generated;
                        successCount++;
                        
                        _logger.LogInformation("Generated {Count} alerts for household {HouseholdId}", generated, householdId);
                    }
                    catch (Exception ex)
                    {
                        failureCount++;
                        _logger.LogError(ex, "Failed to generate alerts for household {HouseholdId}", householdId);
                    }
                }

                _logger.LogInformation(
                    "Alert generation summary: {TotalAlerts} alerts generated, {SuccessCount} households succeeded, {FailureCount} households failed",
                    totalGenerated, successCount, failureCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting households for alert generation");
                throw;
            }
        }

        private async Task<int> GenerateAlertsForHousehold(
            Guid householdId,
            TheButlerDbContext dbContext,
            CancellationToken cancellationToken)
        {
            var totalGenerated = 0;

            try
            {
                // Generate alerts for each category
                totalGenerated += await GenerateBillAlerts(householdId, dbContext, cancellationToken);
                totalGenerated += await GenerateMaintenanceAlerts(householdId, dbContext, cancellationToken);
                totalGenerated += await GenerateHealthcareAlerts(householdId, dbContext, cancellationToken);
                totalGenerated += await GenerateInsuranceAlerts(householdId, dbContext, cancellationToken);
                totalGenerated += await GenerateDocumentAlerts(householdId, dbContext, cancellationToken);
                totalGenerated += await GenerateBudgetAlerts(householdId, dbContext, cancellationToken);

                return totalGenerated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating alerts for household {HouseholdId}", householdId);
                throw;
            }
        }

        private Alerts CreateAlert(Guid householdId, string type, string category, string severity, int priority,
            string title, string message, string? relatedEntityType = null, Guid? relatedEntityId = null,
            string? relatedEntityName = null, string? actionUrl = null, string? actionLabel = null,
            DateTime? expiresAt = null)
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
                ActionLabel = actionLabel,
                ExpiresAt = expiresAt,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private async Task<int> GenerateBillAlerts(Guid householdId, TheButlerDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var bills = await dbContext.Bills
                .Where(b => b.HouseholdId == householdId && b.Status == "Pending" && b.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var generated = 0;

            foreach (var bill in bills)
            {
                var daysUntilDue = (bill.DueDate.ToDateTime(TimeOnly.MinValue) - now).Days;

                // Check if alert already exists today
                var existingAlert = await dbContext.Alerts
                    .AnyAsync(a => a.HouseholdId == householdId
                        && a.RelatedEntityType == "Bill"
                        && a.RelatedEntityId == bill.Id
                        && a.CreatedAt.Date == now.Date
                        && a.DeletedAt == null, cancellationToken);

                if (existingAlert) continue;

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
                    dbContext.Alerts.Add(alert);
                    generated++;
                }
            }

            if (generated > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return generated;
        }

        private async Task<int> GenerateMaintenanceAlerts(Guid householdId, TheButlerDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var tasks = await dbContext.MaintenanceTasks
                .Where(t => t.HouseholdId == householdId && t.Status != "Completed" && t.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var generated = 0;

            foreach (var task in tasks)
            {
                var daysUntilDue = (task.DueDate.ToDateTime(TimeOnly.MinValue) - now).Days;

                var existingAlert = await dbContext.Alerts
                    .AnyAsync(a => a.HouseholdId == householdId
                        && a.RelatedEntityType == "Maintenance"
                        && a.RelatedEntityId == task.Id
                        && a.CreatedAt.Date == now.Date
                        && a.DeletedAt == null, cancellationToken);

                if (existingAlert) continue;

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
                    dbContext.Alerts.Add(alert);
                    generated++;
                }
            }

            if (generated > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return generated;
        }

        private async Task<int> GenerateHealthcareAlerts(Guid householdId, TheButlerDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var generated = 0;

            // Appointments
            var appointments = await dbContext.Appointments
                .Where(a => a.HouseholdId == householdId 
                    && a.AppointmentDate >= DateOnly.FromDateTime(now)
                    && a.DeletedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var appointment in appointments)
            {
                var appointmentDateTime = appointment.AppointmentDate.ToDateTime(appointment.AppointmentTime ?? TimeOnly.MinValue);
                var daysUntilAppointment = (appointmentDateTime - now).Days;

                var existingAlert = await dbContext.Alerts
                    .AnyAsync(a => a.HouseholdId == householdId
                        && a.RelatedEntityType == "Appointment"
                        && a.RelatedEntityId == appointment.Id
                        && a.CreatedAt.Date == now.Date
                        && a.DeletedAt == null, cancellationToken);

                if (existingAlert) continue;

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
                    dbContext.Alerts.Add(alert);
                    generated++;
                }
            }

            // Medications
            var medications = await dbContext.Medications
                .Where(m => m.HouseholdId == householdId && m.IsActive == true && m.DeletedAt == null)
                .ToListAsync(cancellationToken);

            foreach (var medication in medications)
            {
                if (medication.RefillsRemaining.HasValue && medication.RefillsRemaining.Value <= 2)
                {
                    var existingAlert = await dbContext.Alerts
                        .AnyAsync(a => a.HouseholdId == householdId
                            && a.RelatedEntityType == "Medication"
                            && a.RelatedEntityId == medication.Id
                            && a.CreatedAt.Date == now.Date
                            && a.DeletedAt == null, cancellationToken);

                    if (!existingAlert)
                    {
                        var alert = CreateAlert(householdId, AlertType.Warning, AlertCategory.Healthcare, AlertSeverity.Medium, AlertPriority.Medium,
                            "Prescription Refill Needed", $"{medication.Name} - {medication.RefillsRemaining} refill(s) remaining",
                            "Medication", medication.Id, medication.Name, $"/healthcare/medications?id={medication.Id}", "Request Refill");

                        dbContext.Alerts.Add(alert);
                        generated++;
                    }
                }
            }

            if (generated > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return generated;
        }

        private async Task<int> GenerateInsuranceAlerts(Guid householdId, TheButlerDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var policies = await dbContext.InsurancePolicies
                .Where(p => p.HouseholdId == householdId 
                    && p.RenewalDate >= DateOnly.FromDateTime(now)
                    && p.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var generated = 0;

            foreach (var policy in policies)
            {
                var daysUntilExpiry = (policy.RenewalDate.ToDateTime(TimeOnly.MinValue) - now).Days;

                var existingAlert = await dbContext.Alerts
                    .AnyAsync(a => a.HouseholdId == householdId
                        && a.RelatedEntityType == "Insurance"
                        && a.RelatedEntityId == policy.Id
                        && a.CreatedAt.Date == now.Date
                        && a.DeletedAt == null, cancellationToken);

                if (existingAlert) continue;

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
                    dbContext.Alerts.Add(alert);
                    generated++;
                }
            }

            if (generated > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return generated;
        }

        private async Task<int> GenerateDocumentAlerts(Guid householdId, TheButlerDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var documents = await dbContext.Documents
                .Where(d => d.HouseholdId == householdId && d.ExpiryDate.HasValue && d.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var generated = 0;

            foreach (var document in documents)
            {
                if (!document.ExpiryDate.HasValue) continue;

                var daysUntilExpiry = (document.ExpiryDate.Value.ToDateTime(TimeOnly.MinValue) - now).Days;

                var existingAlert = await dbContext.Alerts
                    .AnyAsync(a => a.HouseholdId == householdId
                        && a.RelatedEntityType == "Document"
                        && a.RelatedEntityId == document.Id
                        && a.CreatedAt.Date == now.Date
                        && a.DeletedAt == null, cancellationToken);

                if (existingAlert) continue;

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
                    dbContext.Alerts.Add(alert);
                    generated++;
                }
            }

            if (generated > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return generated;
        }

        private async Task<int> GenerateBudgetAlerts(Guid householdId, TheButlerDbContext dbContext, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var nowDate = DateOnly.FromDateTime(now);
            
            var budgets = await dbContext.Budgets
                .Include(b => b.BudgetPeriods)
                .Where(b => b.HouseholdId == householdId && b.DeletedAt == null)
                .ToListAsync(cancellationToken);

            var generated = 0;

            foreach (var budget in budgets)
            {
                var currentPeriod = budget.BudgetPeriods
                    .FirstOrDefault(p => p.PeriodStart <= nowDate && p.PeriodEnd >= nowDate);

                if (currentPeriod == null) continue;

                var spending = await dbContext.Transactions
                    .Where(t => t.HouseholdId == householdId
                        && t.CategoryId == budget.CategoryId
                        && t.Date >= currentPeriod.PeriodStart
                        && t.Date <= currentPeriod.PeriodEnd
                        && t.DeletedAt == null)
                    .SumAsync(t => t.Amount, cancellationToken);

                if (budget.LimitAmount <= 0) continue;

                var percentageUsed = (spending / budget.LimitAmount) * 100;

                var existingAlert = await dbContext.Alerts
                    .AnyAsync(a => a.HouseholdId == householdId
                        && a.RelatedEntityType == "Budget"
                        && a.RelatedEntityId == budget.Id
                        && a.CreatedAt.Date == now.Date
                        && a.DeletedAt == null, cancellationToken);

                if (existingAlert) continue;

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
                    dbContext.Alerts.Add(alert);
                    generated++;
                }
            }

            if (generated > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            return generated;
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("AlertGenerationServiceV2 is stopping...");
            await base.StopAsync(cancellationToken);
        }
    }
}

