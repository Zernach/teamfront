using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using SmartScheduler.Data;
using SmartScheduler.Services;
using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;

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
// EB provides PORT environment variable, fallback to 5000 for local development
// Only set UseUrls if ASPNETCORE_URLS is not already set
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = false;
    });

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            // Allow localhost origins
            if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase))
                return true;
            
            // Allow S3 website origins
            if (origin.Contains("teamfront-smart-scheduler-frontend.s3-website", StringComparison.OrdinalIgnoreCase))
                return true;
            
            // Allow CloudFront distributions
            if (origin.EndsWith(".cloudfront.net", StringComparison.OrdinalIgnoreCase))
                return true;
            
            return false;
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
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
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
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

builder.Services.AddAuthorization();

var app = builder.Build();

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        // Ensure database can connect
        if (!dbContext.Database.CanConnect())
        {
            logger.LogInformation("Database does not exist. Creating database...");
            dbContext.Database.EnsureCreated();
        }
        else
        {
            // Check if users table exists
            var connection = dbContext.Database.GetDbConnection();
            if (connection.State != ConnectionState.Open)
            {
                connection.Open();
            }
            using var command = connection.CreateCommand();
            command.CommandText = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')";
            var tableExists = command.ExecuteScalar();
            
            if (tableExists == null || !(bool)tableExists)
            {
                logger.LogInformation("Users table does not exist. Creating users table...");
                // Create users table manually
                dbContext.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP NOT NULL,
                        updated_at TIMESTAMP NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);
                    CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
                ");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while ensuring database is created.");
        throw;
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS (must be before UseAuthentication, UseAuthorization and MapControllers)
app.UseCors("AllowFrontend");

// Note: HTTPS redirection disabled for Elastic Beanstalk (handled by load balancer)
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => "OK");

// Root endpoint
app.MapGet("/", () => "Hello World from Smart Scheduler Backend!");

app.Run();
