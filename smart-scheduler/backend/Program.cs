using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Data.Common;
using SmartScheduler.Data;
using SmartScheduler.Services;
using SmartScheduler.Middleware;
using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using SmartScheduler.Logging;
using SmartScheduler.Converters;
using MediatR;
using Npgsql;

// Set default environment to Local if not specified
var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
if (string.IsNullOrEmpty(env))
{
    Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Local");
}

var options = new WebApplicationOptions
{
    EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Local"
};

var builder = WebApplication.CreateBuilder(options);

// Configure port binding for Elastic Beanstalk
// EB provides PORT environment variable, fallback to 5001 for local development (avoid conflict with invoice-me)
// Only set UseUrls if ASPNETCORE_URLS is not already set
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "5001";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container
builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ApiLoggingFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = false;
        // Add TimeSpan converter to handle duration strings like "04:00:00"
        options.JsonSerializerOptions.Converters.Add(new TimeSpanJsonConverter());
    });

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS - Allow ALL origins including CloudFront - completely open CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Allow ALL origins including CloudFront
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("*") // Expose all headers including CloudFront headers
              .SetPreflightMaxAge(TimeSpan.FromHours(1)); // Cache preflight requests for 1 hour
        // Note: AllowCredentials() is removed to allow "*" pattern and make API completely public
    });
});

// Configure Database
// Connection string is loaded from appsettings.{Environment}.json based on ASPNETCORE_ENVIRONMENT
// Environments: Local, Dev, Prod (case-insensitive)
// Default: Local (if ASPNETCORE_ENVIRONMENT is not set)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found. Please ensure the appropriate appsettings.{Environment}.json file exists.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

// Add FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// Register services
builder.Services.AddScoped<IAvailabilityService, AvailabilityService>();
builder.Services.AddScoped<IDistanceService, DistanceService>();
builder.Services.AddScoped<IScoringService, ScoringService>();
builder.Services.AddScoped<IJwtService, JwtService>();

// Configure Cognito JWT Authentication
// UserPoolId can be set via:
// 1. AWS:Cognito:UserPoolId in appsettings.json (or environment-specific files)
// 2. AWS_COGNITO_USER_POOL_ID environment variable (recommended)
// Run ./deploy_auths.sh to get the User Pool ID
var cognitoUserPoolId = builder.Configuration["AWS:Cognito:UserPoolId"] 
    ?? Environment.GetEnvironmentVariable("AWS_COGNITO_USER_POOL_ID")
    ?? throw new InvalidOperationException(
        "AWS Cognito User Pool ID is not configured. " +
        "Set AWS_COGNITO_USER_POOL_ID environment variable or configure AWS:Cognito:UserPoolId in appsettings.json. " +
        "Run ./deploy_auths.sh to get the User Pool ID.");
var cognitoRegion = builder.Configuration["AWS:Cognito:Region"] 
    ?? Environment.GetEnvironmentVariable("AWS_COGNITO_REGION")
    ?? "us-west-1";

// Cognito JWKS endpoint: https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json
var cognitoIssuer = $"https://cognito-idp.{cognitoRegion}.amazonaws.com/{cognitoUserPoolId}";
var jwksUrl = $"{cognitoIssuer}/.well-known/jwks.json";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    // Don't challenge by default - allow anonymous access
    // Only challenge when explicitly required by [Authorize] attribute
    options.DefaultChallengeScheme = null;
})
.AddJwtBearer(options =>
{
    options.Authority = cognitoIssuer;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false, // Cognito tokens don't always have audience
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = cognitoIssuer,
        // Cognito uses RS256, so we need to fetch JWKS
        // The Authority property above will automatically fetch JWKS from the well-known endpoint
    };
    
    // Configure metadata refresh
    options.MetadataAddress = $"{cognitoIssuer}/.well-known/openid-configuration";
    
    // Handle token validation events
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("Authentication failed: {Error}", context.Exception.Message);
            // Don't fail the request - allow it to proceed as anonymous
            context.NoResult();
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // Don't challenge by default - allow anonymous access
            // Only challenge when explicitly required
            context.HandleResponse();
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogDebug("Token validated for user: {UserId}", context.Principal?.Identity?.Name);
            return Task.CompletedTask;
        }
    };
});

// Configure authorization to allow all requests by default - completely public API
builder.Services.AddAuthorization(options =>
{
    // Create a single allow-all policy and assign it to both default and fallback
    var allowAllPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAssertion(_ => true) // Always allow - no authentication required
        .Build();

    // Set default policy to allow all (no authentication required)
    options.DefaultPolicy = allowAllPolicy;

    // Ensure the fallback policy also allows anonymous access for endpoints without explicit metadata
    options.FallbackPolicy = allowAllPolicy;
});

var app = builder.Build();

// Apply migrations with handling for existing tables
await ApplyMigrationsAsync(app);

static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        logger.LogInformation("Checking database migration status...");
        
        // Check if migration history table exists
        var connection = dbContext.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
        {
            await connection.OpenAsync();
        }
        
        using var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = '__EFMigrationsHistory'
            )";
        var historyTableExists = (bool)(await command.ExecuteScalarAsync())!;
        
        if (!historyTableExists)
        {
            // Check if tables already exist (indicating manual setup or previous migration)
            command.CommandText = @"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'contractors'
                )";
            var contractorsTableExists = (bool)(await command.ExecuteScalarAsync())!;
            
            if (contractorsTableExists)
            {
                logger.LogWarning("Database tables exist but migration history is missing. " +
                    "Creating migration history table and marking initial migration as applied...");
                
                // Create migration history table
                command.CommandText = @"
                    CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                        ""MigrationId"" character varying(150) NOT NULL,
                        ""ProductVersion"" character varying(32) NOT NULL,
                        CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                    )";
                await command.ExecuteNonQueryAsync();
                
                // Mark the initial migration as applied
                command.CommandText = @"
                    INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                    VALUES ('20251112185554_InitialCreate', '8.0.0')
                    ON CONFLICT (""MigrationId"") DO NOTHING";
                await command.ExecuteNonQueryAsync();
                
                logger.LogInformation("Migration history initialized. Existing tables are now tracked.");
            }
            else
            {
                // No tables exist, apply migrations normally
                logger.LogInformation("Applying database migrations...");
                await ApplyMigrationsWithErrorHandlingAsync(dbContext, logger, connection);
                logger.LogInformation("Database migrations applied successfully.");
            }
        }
        else
        {
            // Migration history exists, check if we need to apply migrations
            command.CommandText = @"
                SELECT COUNT(*) FROM ""__EFMigrationsHistory""
                WHERE ""MigrationId"" = '20251112185554_InitialCreate'";
            var migrationApplied = Convert.ToInt32(await command.ExecuteScalarAsync()) > 0;
            
            if (!migrationApplied)
            {
                logger.LogInformation("Applying database migrations...");
                await ApplyMigrationsWithErrorHandlingAsync(dbContext, logger, connection);
                logger.LogInformation("Database migrations applied successfully.");
            }
            else
            {
                logger.LogInformation("All migrations are already applied.");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while applying database migrations.");
        // Don't throw - allow application to start even if migrations fail
        // This is important for production environments where the database might be in an inconsistent state
        logger.LogWarning("Application will continue to start despite migration errors. " +
            "Please verify database schema manually if you encounter issues.");
    }
}

static async Task ApplyMigrationsWithErrorHandlingAsync(
    ApplicationDbContext dbContext, 
    ILogger logger, 
    DbConnection connection)
{
    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (PostgresException pgEx) when (pgEx.SqlState == "42P07") // relation already exists
    {
        logger.LogWarning("Migration failed because table already exists (PostgreSQL error 42P07). " +
            "This usually means tables were created manually or from a previous migration. " +
            "Verifying table existence and updating migration history...");
        
        // Check if all required tables exist
        var requiredTables = new[] { "contractors", "jobs", "assignments", "contractor_working_hours", "users" };
        var existingTables = new List<string>();
        
        using var command = connection.CreateCommand();
        foreach (var tableName in requiredTables)
        {
            command.CommandText = $@"
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = '{tableName}'
                )";
            var exists = (bool)(await command.ExecuteScalarAsync())!;
            if (exists)
            {
                existingTables.Add(tableName);
            }
        }
        
        if (existingTables.Count == requiredTables.Length)
        {
            logger.LogInformation("All required tables exist. Marking migration as applied...");
            
            // Ensure migration history table exists
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""__EFMigrationsHistory"" (
                    ""MigrationId"" character varying(150) NOT NULL,
                    ""ProductVersion"" character varying(32) NOT NULL,
                    CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                )";
            await command.ExecuteNonQueryAsync();
            
            // Mark the initial migration as applied
            command.CommandText = @"
                INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                VALUES ('20251112185554_InitialCreate', '8.0.0')
                ON CONFLICT (""MigrationId"") DO NOTHING";
            await command.ExecuteNonQueryAsync();
            
            logger.LogInformation("Migration history updated. Database schema is consistent.");
        }
        else
        {
            logger.LogError("Some required tables are missing. Existing tables: {ExistingTables}. " +
                "Required tables: {RequiredTables}. Please check your database schema.",
                string.Join(", ", existingTables),
                string.Join(", ", requiredTables));
            // Re-throw if critical tables are missing
            throw;
        }
    }
    catch (PostgresException pgEx)
    {
        logger.LogError(pgEx, "PostgreSQL error occurred during migration: {SqlState} - {MessageText}",
            pgEx.SqlState, pgEx.MessageText);
        // Re-throw non-relation-exists errors as they might be critical
        throw;
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Request logging middleware (should be early in pipeline to catch all requests)
app.UseMiddleware<RequestLoggingMiddleware>();

// Enable CORS (must be before UseAuthentication, UseAuthorization and MapControllers)
app.UseCors("AllowFrontend");

// Add CORS logging middleware
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    var origin = context.Request.Headers["Origin"].ToString();
    var method = context.Request.Method;
    
    if (method == "OPTIONS")
    {
        logger.LogInformation("CORS Preflight: {Method} {Path} from Origin: {Origin}", 
            method, context.Request.Path, origin);
    }
    else if (!string.IsNullOrEmpty(origin))
    {
        logger.LogDebug("CORS Request: {Method} {Path} from Origin: {Origin}", 
            method, context.Request.Path, origin);
    }
    
    await next();
});

// Note: HTTPS redirection disabled for Elastic Beanstalk (handled by load balancer)
app.UseAuthentication();
app.UseAuthorization();

// Add route resolution logging
app.Use(async (context, next) =>
{
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    var requestId = context.Items["RequestId"]?.ToString() ?? "unknown";
    
    await next();
    
    // Log route resolution after the request is processed
    var routeData = context.GetRouteData();
    if (routeData != null && routeData.Values.Any())
    {
        logger.LogDebug("[RequestId: {RequestId}] Route resolved: {RouteValues}",
            requestId, string.Join(", ", routeData.Values.Select(kvp => $"{kvp.Key}={kvp.Value}")));
    }
    else if (context.Response.StatusCode == 404)
    {
        logger.LogWarning("[RequestId: {RequestId}] Route NOT resolved for {Method} {Path}",
            requestId, context.Request.Method, context.Request.Path);
    }
});

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => "OK");

// Root endpoint
app.MapGet("/", () => "Hello World from Smart Scheduler Backend!");

app.Run();
