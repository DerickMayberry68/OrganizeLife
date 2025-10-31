using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TheButler.Infrastructure.Data;
using TheButler.Infrastructure.Services;
using TheButler.Api.Services;

namespace TheButler.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container

            builder.Configuration.AddEnvironmentVariables();

            

            // Configure PostgreSQL with Supabase
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            builder.Services.AddDbContext<TheButlerDbContext>(options =>
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                }));

            // Map flat env vars to hierarchical keys
            var supabaseUrl = builder.Configuration["SUPABASE_URL"]
                              ?? throw new InvalidOperationException("SUPABASE_URL is missing");

            var supabaseAnonKey = builder.Configuration["SUPABASE_ANON_KEY"]
                                  ?? throw new InvalidOperationException("SUPABASE_ANON_KEY is missing");

            var supabaseJwtSecret = builder.Configuration["SUPABASE_JWT_SECRET"]
                                    ?? throw new InvalidOperationException("SUPABASE_JWT_SECRET is missing");

            // Make available under Supabase:Key
            builder.Configuration["Supabase:Url"] = supabaseUrl;
            builder.Configuration["Supabase:AnonKey"] = supabaseAnonKey;
            builder.Configuration["Supabase:JwtSecret"] = supabaseJwtSecret;

            // Configure Supabase Authentication
            //var supabaseJwtSecret = builder.Configuration["Supabase:JwtSecret"];
            //var supabaseUrl = builder.Configuration["Supabase:Url"];

            // Only configure authentication if Supabase credentials are provided
            if (!string.IsNullOrEmpty(supabaseJwtSecret) && 
                !string.IsNullOrEmpty(supabaseUrl) &&
                !supabaseJwtSecret.Contains("YOUR_") && 
                !supabaseUrl.Contains("YOUR_"))
            {
                // Clear default claim type mappings to preserve original JWT claims
                Microsoft.IdentityModel.JsonWebTokens.JsonWebTokenHandler.DefaultInboundClaimTypeMap.Clear();
                System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
                
                builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.MapInboundClaims = false; // Preserve original claim names
                        // Try UTF-8 encoding first (most common for Supabase)
                        byte[] key;
                        try
                        {
                            key = Encoding.UTF8.GetBytes(supabaseJwtSecret);
                        }
                        catch
                        {
                            // Fallback to base64 if UTF-8 fails
                            key = Convert.FromBase64String(supabaseJwtSecret);
                        }
                        
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(key),
                            ValidateIssuer = true,
                            ValidIssuer = $"{supabaseUrl}/auth/v1", // Supabase includes /auth/v1 in the issuer
                            ValidateAudience = true,
                            ValidAudience = "authenticated",
                            ValidateLifetime = true,
                            ClockSkew = TimeSpan.Zero
                        };
                    });

                builder.Services.AddAuthorization();
                
                // Register Supabase Auth Service
                builder.Services.AddScoped<ISupabaseAuthService, SupabaseAuthService>();
            }
            else
            {
                // Development mode - no authentication configured
                Console.WriteLine("⚠️  Supabase credentials not configured. Authentication is disabled.");
                Console.WriteLine("   To enable authentication, update Supabase:JwtSecret and Supabase:Url in appsettings.json");
                Console.WriteLine("   See SUPABASE-AUTH-SETUP.md for details.");
                
                // Add minimal authorization for development
                builder.Services.AddAuthorization();
            }

            // Register HttpClient for API calls (e.g., to Supabase)
            builder.Services.AddHttpClient();

            // Register Alert Generation Background Service
            // Only enable in Development or if explicitly configured
            var enableAlertGeneration = builder.Configuration.GetValue<bool>("AlertGeneration:Enabled", false);
            if (builder.Environment.IsDevelopment() || enableAlertGeneration)
            {
                builder.Services.AddHostedService<AlertGenerationServiceV2>();
                Console.WriteLine("✅ Alert Generation Background Service V2 enabled (direct database access)");
            }

            // Configure CORS for Angular app
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularApp", policy =>
                {
                    policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token from Supabase.",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "OranizeLife API V1");
            });

            app.UseHttpsRedirection();

            app.UseCors("AllowAngularApp");
            
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}