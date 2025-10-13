using Microsoft.EntityFrameworkCore;
using TheButler.Infrastructure.Data;

namespace TheButler.Api.Services
{
    /// <summary>
    /// Background service that automatically generates alerts for all active households
    /// Runs on a configurable schedule (default: every hour)
    /// </summary>
    public class AlertGenerationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AlertGenerationService> _logger;
        private readonly IConfiguration _configuration;
        private TimeSpan _interval;

        public AlertGenerationService(
            IServiceProvider serviceProvider,
            ILogger<AlertGenerationService> logger,
            IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _configuration = configuration;

            // Read interval from configuration (default: 1 hour)
            var intervalMinutes = _configuration.GetValue<int>("AlertGeneration:IntervalMinutes", 60);
            _interval = TimeSpan.FromMinutes(intervalMinutes);

            _logger.LogInformation("AlertGenerationService initialized with {IntervalMinutes} minute interval", intervalMinutes);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AlertGenerationService started");

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

            _logger.LogInformation("AlertGenerationService stopped");
        }

        private async Task GenerateAlertsForAllHouseholds(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<TheButlerDbContext>();
            var httpClientFactory = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

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
                        var generated = await GenerateAlertsForHousehold(householdId, httpClientFactory, configuration, cancellationToken);
                        totalGenerated += generated;
                        successCount++;
                        
                        _logger.LogInformation("Generated {Count} alerts for household {HouseholdId}", generated, householdId);
                    }
                    catch (Exception ex)
                    {
                        failureCount++;
                        _logger.LogError(ex, "Failed to generate alerts for household {HouseholdId}", householdId);
                    }

                    // Small delay between households to avoid overwhelming the system
                    await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
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
            IHttpClientFactory httpClientFactory, 
            IConfiguration configuration,
            CancellationToken cancellationToken)
        {
            // Call the AlertsController endpoint to generate all alerts
            // Using HttpClient to call our own API
            var client = httpClientFactory.CreateClient();
            
            // Get the base URL from configuration or use localhost
            var baseUrl = configuration.GetValue<string>("AlertGeneration:ApiBaseUrl", "http://localhost:5000");
            var url = $"{baseUrl}/api/Alerts/generate/all/{householdId}";

            try
            {
                var response = await client.PostAsync(url, null, cancellationToken);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync(cancellationToken);
                    // Parse the response to get the count (optional)
                    _logger.LogDebug("Alert generation response for household {HouseholdId}: {Content}", householdId, content);
                    return 1; // Success
                }
                else
                {
                    _logger.LogWarning("Alert generation returned {StatusCode} for household {HouseholdId}", 
                        response.StatusCode, householdId);
                    return 0;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "HTTP request failed for household {HouseholdId}", householdId);
                throw;
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("AlertGenerationService is stopping...");
            await base.StopAsync(cancellationToken);
        }
    }
}

